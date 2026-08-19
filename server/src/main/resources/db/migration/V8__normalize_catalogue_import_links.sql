CREATE TABLE source_import_record_catalogue_entries (
  source_import_record_id bigint NOT NULL
    REFERENCES source_import_records(id) ON DELETE CASCADE,
  catalogue_entry_id bigint NOT NULL
    REFERENCES catalogue_entries(id) ON DELETE CASCADE,
  PRIMARY KEY (source_import_record_id, catalogue_entry_id)
);

INSERT INTO source_import_record_catalogue_entries
  (source_import_record_id, catalogue_entry_id)
SELECT id, catalogue_entry_id
FROM source_import_records
WHERE catalogue_entry_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO source_import_record_catalogue_entries
  (source_import_record_id, catalogue_entry_id)
SELECT source.id, entry.id
FROM senses sense
JOIN source_import_records source ON source.id = sense.source_import_record_id
JOIN catalogue_entries entry
  ON entry.source_code = 'oxford'
 AND entry.external_key = source.source_system || ':' || source.source_id || ':' || sense.cefr_level
ON CONFLICT DO NOTHING;

DELETE FROM catalogue_entry_senses mapping
USING catalogue_entries entry
WHERE entry.id = mapping.catalogue_entry_id
  AND entry.source_code = 'oxford';

INSERT INTO catalogue_entry_senses
  (catalogue_entry_id, sense_id, match_method, match_confidence, is_primary)
SELECT entry.id, sense.id, 'source_record', 1.000, true
FROM senses sense
JOIN source_import_records source ON source.id = sense.source_import_record_id
JOIN catalogue_entries entry
  ON entry.source_code = 'oxford'
 AND entry.external_key = source.source_system || ':' || source.source_id || ':' || sense.cefr_level;

DELETE FROM catalogue_entry_parts_of_speech entry_pos
USING catalogue_entries entry
WHERE entry.id = entry_pos.catalogue_entry_id
  AND entry.source_code = 'oxford';

INSERT INTO catalogue_entry_parts_of_speech
  (catalogue_entry_id, part_of_speech_code)
SELECT DISTINCT entry.id, sense_pos.part_of_speech_code
FROM senses sense
JOIN source_import_records source ON source.id = sense.source_import_record_id
JOIN catalogue_entries entry
  ON entry.source_code = 'oxford'
 AND entry.external_key = source.source_system || ':' || source.source_id || ':' || sense.cefr_level
JOIN sense_parts_of_speech sense_pos ON sense_pos.sense_id = sense.id
ON CONFLICT DO NOTHING;

DROP INDEX source_import_records_catalogue_entry_idx;

ALTER TABLE source_import_records
  DROP COLUMN catalogue_entry_id;

CREATE INDEX source_import_record_catalogue_entries_entry_idx
  ON source_import_record_catalogue_entries (catalogue_entry_id, source_import_record_id);
