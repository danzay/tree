CREATE TEMP TABLE _redundant_article_variant_senses (
  sense_id bigint PRIMARY KEY,
  headword_id bigint NOT NULL,
  catalogue_entry_id bigint NOT NULL
) ON COMMIT DROP;

INSERT INTO _redundant_article_variant_senses
  (sense_id, headword_id, catalogue_entry_id)
SELECT DISTINCT sense.id, sense.headword_id, catalogue_entry.id
FROM catalogue_entries catalogue_entry
JOIN source_import_record_catalogue_entries source_link
  ON source_link.catalogue_entry_id = catalogue_entry.id
JOIN source_import_records source_record
  ON source_record.id = source_link.source_import_record_id
JOIN senses sense ON sense.source_import_record_id = source_record.id
WHERE catalogue_entry.source_code = 'esl_lounge'
  AND lower(btrim(catalogue_entry.source_headword)) = 'a / an'
  AND sense.preferred_level_source_code = 'esl_lounge';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM review_events review
    JOIN _redundant_article_variant_senses redundant ON redundant.sense_id = review.sense_id
  ) OR EXISTS (
    SELECT 1
    FROM assistant_changes change
    JOIN _redundant_article_variant_senses redundant ON redundant.sense_id = change.sense_id
  ) THEN
    RAISE EXCEPTION 'Cannot merge article spelling variant with existing history';
  END IF;
END
$$;

DELETE FROM catalogue_entry_senses mapping
USING _redundant_article_variant_senses redundant
WHERE mapping.sense_id = redundant.sense_id;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT redundant.catalogue_entry_id,
       target.id,
       'manual',
       1.000,
       true
FROM _redundant_article_variant_senses redundant
JOIN headwords target_headword ON target_headword.normalized_word = 'a, an'
JOIN senses target ON target.headword_id = target_headword.id AND target.cefr_level = 'A1'
JOIN catalogue_entry_senses oxford_mapping ON oxford_mapping.sense_id = target.id
JOIN catalogue_entries oxford_entry
  ON oxford_entry.id = oxford_mapping.catalogue_entry_id
 AND oxford_entry.source_code = 'oxford'
ON CONFLICT (catalogue_entry_id, sense_id) DO UPDATE SET
  match_method = EXCLUDED.match_method,
  match_confidence = EXCLUDED.match_confidence,
  is_primary = EXCLUDED.is_primary,
  mapped_at = now();

DELETE FROM sense_progress progress
USING _redundant_article_variant_senses redundant
WHERE progress.sense_id = redundant.sense_id;

DELETE FROM senses sense
USING _redundant_article_variant_senses redundant
WHERE sense.id = redundant.sense_id;

DELETE FROM headwords headword
USING _redundant_article_variant_senses redundant
WHERE headword.id = redundant.headword_id
  AND NOT EXISTS (SELECT 1 FROM senses sense WHERE sense.headword_id = headword.id);
