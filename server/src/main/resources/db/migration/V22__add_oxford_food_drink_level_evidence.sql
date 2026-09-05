CREATE TEMP TABLE _oxford_level_evidence (
  external_key text PRIMARY KEY,
  source_headword text NOT NULL,
  normalized_headword text NOT NULL,
  oxford_level text NOT NULL,
  part_of_speech_code text NOT NULL,
  dictionary_path text NOT NULL,
  esl_external_key text NOT NULL UNIQUE,
  esl_level text NOT NULL
) ON COMMIT DROP;

INSERT INTO _oxford_level_evidence
  (external_key, source_headword, normalized_headword, oxford_level,
   part_of_speech_code, dictionary_path, esl_external_key, esl_level)
VALUES
  ('website_level:/definition/english/abstain', 'abstain', 'abstain', 'C2',
   'verb', '/definition/english/abstain', 'c2:abstain:verb', 'C2'),
  ('website_level:/definition/english/abstinence', 'abstinence', 'abstinence', 'C2',
   'noun', '/definition/english/abstinence', 'c2:abstinence:noun', 'C2'),
  ('website_level:/definition/english/beverage', 'beverage', 'beverage', 'C1',
   'noun', '/definition/english/beverage', 'c1:beverage:noun', 'C1'),
  ('website_level:/definition/english/cream_1', 'cream', 'cream', 'A1',
   'noun', '/definition/english/cream_1', 'a1:cream:noun', 'A1'),
  ('website_level:/definition/english/duck_1', 'duck', 'duck', 'A2',
   'noun', '/definition/english/duck_1', 'a2:duck:noun', 'A2'),
  ('website_level:/definition/english/grape', 'grape', 'grape', 'B1',
   'noun', '/definition/english/grape', 'a2:grape:noun', 'A2'),
  ('website_level:/definition/english/honey', 'honey', 'honey', 'B1',
   'noun', '/definition/english/honey', 'b1:honey:noun', 'B1'),
  ('website_level:/definition/english/insipid', 'insipid', 'insipid', 'C2',
   'adjective', '/definition/english/insipid', 'c2:insipid:adjective', 'C2'),
  ('website_level:/definition/english/pasta', 'pasta', 'pasta', 'A2',
   'noun', '/definition/english/pasta', 'a1:pasta:noun', 'A1'),
  ('website_level:/definition/english/patronage', 'patronage', 'patronage', 'C2',
   'noun', '/definition/english/patronage', 'c2:patronage:noun', 'C2'),
  ('website_level:/definition/english/pear', 'pear', 'pear', 'B1',
   'noun', '/definition/english/pear', 'a2:pear:noun', 'A2'),
  ('website_level:/definition/english/pizza', 'pizza', 'pizza', 'A1',
   'noun', '/definition/english/pizza', 'a1:pizza:noun', 'A1'),
  ('website_level:/definition/english/pungent', 'pungent', 'pungent', 'C2',
   'adjective', '/definition/english/pungent', 'c2:pungent:adjective', 'C2'),
  ('website_level:/definition/english/rabbit_1', 'rabbit', 'rabbit', 'A2',
   'noun', '/definition/english/rabbit_1', 'a1:rabbit:noun', 'A1'),
  ('website_level:/definition/english/sage_1', 'sage', 'sage', 'C2',
   'noun', '/definition/english/sage_1', 'c2:sage:noun', 'C2'),
  ('website_level:/definition/english/strawberry', 'strawberry', 'strawberry', 'A2',
   'noun', '/definition/english/strawberry', 'a2:strawberry:noun', 'A2'),
  ('website_level:/definition/english/tariff', 'tariff', 'tariff', 'C1',
   'noun', '/definition/english/tariff', 'c2:tariff:noun', 'C2'),
  ('website_level:/definition/english/trifle_1', 'trifle', 'trifle', 'C2',
   'noun', '/definition/english/trifle_1', 'c2:trifle:noun', 'C2'),
  ('website_level:/definition/english/unpalatable', 'unpalatable', 'unpalatable', 'C2',
   'adjective', '/definition/english/unpalatable', 'c2:unpalatable:adjective', 'C2'),
  ('website_level:/definition/english/utensil', 'utensil', 'utensil', 'C1',
   'noun', '/definition/english/utensil', 'c2:utensil:noun', 'C2'),
  ('website_level:/definition/english/vintage_1', 'vintage', 'vintage', 'C2',
   'noun', '/definition/english/vintage_1', 'c2:vintage:noun', 'C2');

INSERT INTO catalogue_entries
  (source_code, external_key, source_headword, normalized_headword, cefr_level,
   source_metadata)
SELECT 'oxford',
       evidence.external_key,
       evidence.source_headword,
       evidence.normalized_headword,
       evidence.oxford_level,
       jsonb_build_object(
         'levelEvidenceUrl',
         'https://www.oxfordlearnersdictionaries.com' || evidence.dictionary_path
       )
FROM _oxford_level_evidence evidence
ON CONFLICT (source_code, external_key) DO UPDATE SET
  source_headword = EXCLUDED.source_headword,
  normalized_headword = EXCLUDED.normalized_headword,
  cefr_level = EXCLUDED.cefr_level,
  source_metadata = EXCLUDED.source_metadata,
  updated_at = now();

INSERT INTO catalogue_entry_parts_of_speech
  (catalogue_entry_id, part_of_speech_code)
SELECT entry.id, evidence.part_of_speech_code
FROM _oxford_level_evidence evidence
JOIN catalogue_entries entry
  ON entry.source_code = 'oxford'
 AND entry.external_key = evidence.external_key
ON CONFLICT DO NOTHING;

CREATE TEMP TABLE _resolved_oxford_level_evidence ON COMMIT DROP AS
SELECT evidence.*,
       oxford_entry.id AS oxford_catalogue_entry_id,
       mapping.sense_id,
       source_link.source_import_record_id
FROM _oxford_level_evidence evidence
JOIN catalogue_entries esl_entry
  ON esl_entry.source_code = 'esl_lounge'
 AND esl_entry.external_key = evidence.esl_external_key
JOIN catalogue_entry_senses mapping
  ON mapping.catalogue_entry_id = esl_entry.id
JOIN source_import_record_catalogue_entries source_link
  ON source_link.catalogue_entry_id = esl_entry.id
JOIN catalogue_entries oxford_entry
  ON oxford_entry.source_code = 'oxford'
 AND oxford_entry.external_key = evidence.external_key;

DO $$
BEGIN
  IF (
    SELECT count(*) FROM _resolved_oxford_level_evidence
  ) <> (
    SELECT count(*) FROM _oxford_level_evidence
  ) THEN
    RAISE EXCEPTION 'Each Oxford level record must resolve to exactly one existing ESL sense';
  END IF;
END
$$;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT resolved.oxford_catalogue_entry_id,
       resolved.sense_id,
       'manual',
       1.000,
       true
FROM _resolved_oxford_level_evidence resolved
ON CONFLICT (catalogue_entry_id, sense_id) DO UPDATE SET
  match_method = EXCLUDED.match_method,
  match_confidence = EXCLUDED.match_confidence,
  is_primary = EXCLUDED.is_primary,
  mapped_at = now();

UPDATE senses sense
SET cefr_level = resolved.oxford_level,
    review_status = 'verified',
    preferred_level_source_code = 'oxford',
    updated_at = now()
FROM _resolved_oxford_level_evidence resolved
WHERE sense.id = resolved.sense_id;

INSERT INTO reconciliation_items
  (source_key, issue_type, headword, official_level, source_import_record_id,
   matched_sense_id, status, notes, checked_at)
SELECT 'oxford_website_level:' || resolved.esl_external_key,
       'source_anomaly',
       resolved.source_headword,
       resolved.oxford_level,
       resolved.source_import_record_id,
       resolved.sense_id,
       'resolved',
       'ESL Lounge classifies this entry as ' || resolved.esl_level ||
         '; Oxford Learner''s Dictionaries classifies it as ' ||
         resolved.oxford_level ||
         '. Oxford was selected as the effective level.',
       DATE '2026-09-03'
FROM _resolved_oxford_level_evidence resolved
WHERE resolved.esl_level <> resolved.oxford_level
ON CONFLICT (source_key) DO UPDATE SET
  official_level = EXCLUDED.official_level,
  source_import_record_id = EXCLUDED.source_import_record_id,
  matched_sense_id = EXCLUDED.matched_sense_id,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  checked_at = EXCLUDED.checked_at,
  updated_at = now();
