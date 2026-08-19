CREATE TEMP TABLE _true_esl_article_entries (
  catalogue_entry_id bigint PRIMARY KEY,
  source_headword text NOT NULL,
  cefr_level text NOT NULL
) ON COMMIT DROP;

INSERT INTO _true_esl_article_entries
  (catalogue_entry_id, source_headword, cefr_level)
SELECT id, source_headword, cefr_level
FROM catalogue_entries
WHERE source_code = 'esl_lounge'
  AND lower(btrim(source_headword)) IN ('a / an', 'the');

INSERT INTO catalogue_entry_parts_of_speech
  (catalogue_entry_id, part_of_speech_code)
SELECT catalogue_entry_id, 'article'
FROM _true_esl_article_entries
ON CONFLICT DO NOTHING;

DELETE FROM catalogue_entry_parts_of_speech entry_pos
USING _true_esl_article_entries entry
WHERE entry_pos.catalogue_entry_id = entry.catalogue_entry_id
  AND entry_pos.part_of_speech_code = 'determiner';

UPDATE catalogue_entries catalogue_entry
SET source_metadata = jsonb_set(
      catalogue_entry.source_metadata,
      '{partOfSpeech}',
      '"article"'::jsonb,
      true
    ),
    updated_at = now()
FROM _true_esl_article_entries entry
WHERE catalogue_entry.id = entry.catalogue_entry_id;

UPDATE source_import_records source_record
SET raw_scheduling = jsonb_set(
      source_record.raw_scheduling,
      '{partOfSpeech}',
      '"article"'::jsonb,
      true
    ),
    updated_at = now()
FROM source_import_record_catalogue_entries source_link
JOIN _true_esl_article_entries entry
  ON entry.catalogue_entry_id = source_link.catalogue_entry_id
WHERE source_record.id = source_link.source_import_record_id
  AND source_record.source_system = 'esl_lounge';

CREATE TEMP TABLE _redundant_esl_article_senses (
  sense_id bigint PRIMARY KEY,
  headword_id bigint NOT NULL
) ON COMMIT DROP;

INSERT INTO _redundant_esl_article_senses (sense_id, headword_id)
SELECT DISTINCT sense.id, sense.headword_id
FROM senses sense
JOIN source_import_records source_record
  ON source_record.id = sense.source_import_record_id
JOIN source_import_record_catalogue_entries source_link
  ON source_link.source_import_record_id = source_record.id
JOIN _true_esl_article_entries entry
  ON entry.catalogue_entry_id = source_link.catalogue_entry_id
WHERE source_record.source_system = 'esl_lounge'
  AND sense.preferred_level_source_code = 'esl_lounge';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM review_events review
    JOIN _redundant_esl_article_senses redundant ON redundant.sense_id = review.sense_id
  ) OR EXISTS (
    SELECT 1
    FROM assistant_changes change
    JOIN _redundant_esl_article_senses redundant ON redundant.sense_id = change.sense_id
  ) THEN
    RAISE EXCEPTION 'Cannot merge true article placeholders with existing history';
  END IF;
END
$$;

DELETE FROM catalogue_entry_senses mapping
USING _redundant_esl_article_senses redundant
WHERE mapping.sense_id = redundant.sense_id;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT entry.catalogue_entry_id,
       target.id,
       'manual',
       1.000,
       true
FROM _true_esl_article_entries entry
JOIN headwords target_headword
  ON target_headword.normalized_word = CASE lower(btrim(entry.source_headword))
       WHEN 'a / an' THEN 'a, an'
       ELSE lower(btrim(entry.source_headword))
     END
JOIN senses target
  ON target.headword_id = target_headword.id
 AND target.cefr_level = entry.cefr_level
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
USING _redundant_esl_article_senses redundant
WHERE progress.sense_id = redundant.sense_id;

DELETE FROM senses sense
USING _redundant_esl_article_senses redundant
WHERE sense.id = redundant.sense_id;

DELETE FROM headwords headword
USING _redundant_esl_article_senses redundant
WHERE headword.id = redundant.headword_id
  AND NOT EXISTS (SELECT 1 FROM senses sense WHERE sense.headword_id = headword.id);
