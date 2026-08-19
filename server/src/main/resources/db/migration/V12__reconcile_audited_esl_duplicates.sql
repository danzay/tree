CREATE TEMP TABLE _audited_esl_equivalents (
  external_key text PRIMARY KEY,
  requires_review boolean NOT NULL DEFAULT false
) ON COMMIT DROP;

INSERT INTO _audited_esl_equivalents (external_key, requires_review)
VALUES
  ('a1:all:article', false),
  ('a1:another:article', false),
  ('a1:any:article', false),
  ('a1:born:participle', false),
  ('a1:both:article', false),
  ('a1:each:article', false),
  ('a1:enough:article', false),
  ('a1:every:article', false),
  ('a1:few:article', false),
  ('a1:hello:expression', false),
  ('a1:hi:expression', false),
  ('a1:his:article', false),
  ('a1:its:article', false),
  ('a1:like:preposition', false),
  ('a1:many:article', false),
  ('a1:more:article', false),
  ('a1:most:article', false),
  ('a1:much:article', false),
  ('a1:my:article', false),
  ('a1:no:article', false),
  ('a1:our:article', false),
  ('a1:please:expression', false),
  ('a1:some:article', false),
  ('a1:their:article', false),
  ('a1:would:verb', false),
  ('a1:your:article', false),
  ('a2:average:noun', false),
  ('a2:cycle:verb', false),
  ('a2:dead:adjective', false),
  ('a2:either:article', false),
  ('a2:his:article', false),
  ('a2:least:article', false),
  ('a2:less:article', false),
  ('a2:neither:article', false),
  ('a2:score:verb', false),
  ('a2:several:article', false),
  ('a2:such:article', false),
  ('a2:whose:article', false),
  ('b1:balance:verb', false),
  ('b1:base:verb', false),
  ('b1:bomb:verb', false),
  ('b1:deal:verb', false),
  ('b1:fancy:verb', false),
  ('b1:neither:conjunction', true),
  ('b1:pin:verb', false),
  ('b1:plenty:pronoun', false),
  ('b1:plus:preposition', false),
  ('b1:till:conjunction', false),
  ('b1:whatever:article', false),
  ('b2:editorial:noun', false),
  ('b2:fellow:adjective', false),
  ('b2:fool:verb', false),
  ('b2:panic:verb', false),
  ('b2:wherever:conjunction', false),
  ('c1:audit:verb', false),
  ('c1:capitalist:noun', false),
  ('c1:clash:verb', false),
  ('c1:communist:noun', false),
  ('c1:harvest:verb', false),
  ('c1:meantime:noun', false),
  ('c1:standing:noun', false);

CREATE TEMP TABLE _resolved_esl_duplicates (
  catalogue_entry_id bigint PRIMARY KEY,
  external_key text NOT NULL,
  placeholder_sense_id bigint NOT NULL UNIQUE,
  target_sense_id bigint NOT NULL,
  requires_review boolean NOT NULL
) ON COMMIT DROP;

INSERT INTO _resolved_esl_duplicates
  (catalogue_entry_id, external_key, placeholder_sense_id, target_sense_id, requires_review)
SELECT DISTINCT entry.id,
       entry.external_key,
       placeholder.id,
       target.id,
       audited.requires_review
FROM _audited_esl_equivalents audited
JOIN catalogue_entries entry
  ON entry.source_code = 'esl_lounge'
 AND entry.external_key = audited.external_key
JOIN catalogue_entry_senses placeholder_mapping
  ON placeholder_mapping.catalogue_entry_id = entry.id
JOIN senses placeholder
  ON placeholder.id = placeholder_mapping.sense_id
 AND placeholder.review_status = 'needs_review'
 AND placeholder.preferred_level_source_code = 'esl_lounge'
JOIN senses target
  ON target.headword_id = placeholder.headword_id
 AND target.cefr_level = placeholder.cefr_level
 AND target.id <> placeholder.id
JOIN catalogue_entry_senses oxford_mapping
  ON oxford_mapping.sense_id = target.id
JOIN catalogue_entries oxford_entry
  ON oxford_entry.id = oxford_mapping.catalogue_entry_id
 AND oxford_entry.source_code = 'oxford';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM _audited_esl_equivalents audited
    JOIN catalogue_entries entry
      ON entry.source_code = 'esl_lounge'
     AND entry.external_key = audited.external_key
    LEFT JOIN _resolved_esl_duplicates resolved ON resolved.catalogue_entry_id = entry.id
    WHERE resolved.catalogue_entry_id IS NULL
  ) THEN
    RAISE EXCEPTION 'An audited ESL entry could not be resolved to one Oxford sense';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM review_events review
    JOIN _resolved_esl_duplicates resolved
      ON resolved.placeholder_sense_id = review.sense_id
  ) OR EXISTS (
    SELECT 1
    FROM assistant_changes change
    JOIN _resolved_esl_duplicates resolved
      ON resolved.placeholder_sense_id = change.sense_id
  ) OR EXISTS (
    SELECT 1
    FROM sense_translations translation
    JOIN _resolved_esl_duplicates resolved
      ON resolved.placeholder_sense_id = translation.sense_id
  ) OR EXISTS (
    SELECT 1
    FROM sense_collocations collocation
    JOIN _resolved_esl_duplicates resolved
      ON resolved.placeholder_sense_id = collocation.sense_id
  ) OR EXISTS (
    SELECT 1
    FROM sense_examples example
    JOIN _resolved_esl_duplicates resolved
      ON resolved.placeholder_sense_id = example.sense_id
  ) THEN
    RAISE EXCEPTION 'Cannot merge audited ESL placeholders containing user or learning content';
  END IF;
END
$$;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT catalogue_entry_id,
       target_sense_id,
       'manual',
       CASE WHEN requires_review THEN 0.700 ELSE 1.000 END,
       true
FROM _resolved_esl_duplicates
ON CONFLICT (catalogue_entry_id, sense_id) DO UPDATE SET
  match_method = EXCLUDED.match_method,
  match_confidence = EXCLUDED.match_confidence,
  is_primary = EXCLUDED.is_primary,
  mapped_at = now();

INSERT INTO reconciliation_items
  (source_key, issue_type, headword, official_level, source_import_record_id,
   matched_sense_id, status, notes, checked_at)
SELECT 'esl_lounge:b1:neither:conjunction:oxford_pos_audit',
       'source_anomaly',
       'neither',
       'B1',
       source_link.source_import_record_id,
       resolved.target_sense_id,
       'open',
       'ESL Lounge classifies this entry as a conjunction; Oxford Learner''s Dictionaries classifies its B1 entry as an adverb.',
       DATE '2026-08-19'
FROM _resolved_esl_duplicates resolved
JOIN source_import_record_catalogue_entries source_link
  ON source_link.catalogue_entry_id = resolved.catalogue_entry_id
WHERE resolved.external_key = 'b1:neither:conjunction'
ON CONFLICT (source_key) DO UPDATE SET
  matched_sense_id = EXCLUDED.matched_sense_id,
  source_import_record_id = EXCLUDED.source_import_record_id,
  notes = EXCLUDED.notes,
  checked_at = EXCLUDED.checked_at,
  updated_at = now();

DELETE FROM catalogue_entry_senses mapping
USING _resolved_esl_duplicates resolved
WHERE mapping.sense_id = resolved.placeholder_sense_id;

DELETE FROM sense_progress progress
USING _resolved_esl_duplicates resolved
WHERE progress.sense_id = resolved.placeholder_sense_id;

DELETE FROM senses sense
USING _resolved_esl_duplicates resolved
WHERE sense.id = resolved.placeholder_sense_id;
