CREATE TABLE catalogue_sources (
  code text PRIMARY KEY CHECK (code ~ '^[a-z][a-z0-9_]*$'),
  display_name text NOT NULL CHECK (btrim(display_name) <> ''),
  classification_system text CHECK (btrim(classification_system) <> ''),
  website_url text,
  display_priority integer NOT NULL CHECK (display_priority > 0),
  usage_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE catalogue_entries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_code text NOT NULL REFERENCES catalogue_sources(code) ON DELETE RESTRICT,
  external_key text NOT NULL CHECK (btrim(external_key) <> ''),
  source_headword text NOT NULL CHECK (btrim(source_headword) <> ''),
  normalized_headword text NOT NULL CHECK (btrim(normalized_headword) <> ''),
  cefr_level text CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  source_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_code, external_key)
);

CREATE TABLE catalogue_entry_parts_of_speech (
  catalogue_entry_id bigint NOT NULL REFERENCES catalogue_entries(id) ON DELETE CASCADE,
  part_of_speech_code text NOT NULL REFERENCES parts_of_speech(code) ON DELETE RESTRICT,
  PRIMARY KEY (catalogue_entry_id, part_of_speech_code)
);

CREATE TABLE catalogue_entry_senses (
  catalogue_entry_id bigint NOT NULL REFERENCES catalogue_entries(id) ON DELETE CASCADE,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  match_method text NOT NULL
    CHECK (match_method IN ('source_record', 'headword_level_pos', 'headword_pos', 'manual')),
  match_confidence numeric(4, 3) NOT NULL DEFAULT 1.000
    CHECK (match_confidence >= 0 AND match_confidence <= 1),
  is_primary boolean NOT NULL DEFAULT true,
  mapped_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (catalogue_entry_id, sense_id)
);

ALTER TABLE source_import_records
  ADD COLUMN catalogue_entry_id bigint REFERENCES catalogue_entries(id) ON DELETE RESTRICT;

ALTER TABLE senses
  ADD COLUMN preferred_level_source_code text REFERENCES catalogue_sources(code) ON DELETE RESTRICT;

INSERT INTO catalogue_sources
  (code, display_name, classification_system, website_url, display_priority, usage_notes)
VALUES
  ('oxford', 'Oxford Learner''s Dictionaries', 'CEFR',
   'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000', 1,
   'Preferred source for the effective level when an Oxford classification exists.'),
  ('cambridge_evp', 'Cambridge English Vocabulary Profile', 'CEFR',
   'https://www.englishprofile.org/wordlists/evp', 2,
   'Import only from an authorized export or licensed integration.'),
  ('esl_lounge', 'ESL Lounge', 'CEFR',
   'https://www.esl-lounge.com/student/reference/english-vocabulary-lists.php', 3,
   'Supplementary third-party CEFR-classified vocabulary list.'),
  ('manual', 'Manually added', NULL, NULL, 4,
   'Words and senses added by a user or an approved application workflow.');

INSERT INTO catalogue_entries
  (source_code, external_key, source_headword, normalized_headword, cefr_level, source_metadata)
SELECT 'oxford',
       source.source_system || ':' || source.source_id || ':' || sense.cefr_level,
       source.source_word,
       headword.normalized_word,
       sense.cefr_level,
       jsonb_build_object(
         'originSystem', source.source_system,
         'sourceImportRecordId', source.id,
         'sourceCategories', COALESCE(categories.values, '[]'::jsonb)
       )
FROM senses sense
JOIN headwords headword ON headword.id = sense.headword_id
JOIN source_import_records source ON source.id = sense.source_import_record_id
LEFT JOIN LATERAL (
  SELECT jsonb_agg(sense_source.source_category ORDER BY sense_source.source_category) AS values
  FROM sense_sources sense_source
  WHERE sense_source.sense_id = sense.id
) categories ON true
ON CONFLICT (source_code, external_key) DO NOTHING;

UPDATE source_import_records source
SET catalogue_entry_id = entry.id
FROM senses sense
JOIN catalogue_entries entry
  ON entry.source_code = 'oxford'
 AND entry.external_key = (
   SELECT record.source_system || ':' || record.source_id || ':' || sense.cefr_level
   FROM source_import_records record
   WHERE record.id = sense.source_import_record_id
 )
WHERE sense.source_import_record_id = source.id;

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT source.catalogue_entry_id, sense.id, 'source_record', 1.000, true
FROM senses sense
JOIN source_import_records source ON source.id = sense.source_import_record_id
WHERE source.catalogue_entry_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO catalogue_entry_parts_of_speech (catalogue_entry_id, part_of_speech_code)
SELECT DISTINCT source.catalogue_entry_id, sense_pos.part_of_speech_code
FROM senses sense
JOIN source_import_records source ON source.id = sense.source_import_record_id
JOIN sense_parts_of_speech sense_pos ON sense_pos.sense_id = sense.id
WHERE source.catalogue_entry_id IS NOT NULL
ON CONFLICT DO NOTHING;

UPDATE senses
SET preferred_level_source_code = 'oxford'
WHERE preferred_level_source_code IS NULL;

ALTER TABLE senses
  ALTER COLUMN preferred_level_source_code SET NOT NULL;

CREATE INDEX catalogue_entries_headword_idx
  ON catalogue_entries (normalized_headword, source_code, cefr_level);

CREATE INDEX catalogue_entries_level_idx
  ON catalogue_entries (source_code, cefr_level, id);

CREATE INDEX catalogue_entry_senses_sense_idx
  ON catalogue_entry_senses (sense_id, catalogue_entry_id);

CREATE INDEX source_import_records_catalogue_entry_idx
  ON source_import_records (catalogue_entry_id)
  WHERE catalogue_entry_id IS NOT NULL;

COMMENT ON COLUMN senses.cefr_level IS
  'Effective CEFR level used by the application; source-specific levels live in catalogue_entries.';

COMMENT ON COLUMN senses.preferred_level_source_code IS
  'Source selected for senses.cefr_level. Source-specific classifications are never overwritten.';
