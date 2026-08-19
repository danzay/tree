INSERT INTO parts_of_speech (code, display_name, source_bit, notes)
VALUES (
  'determiner',
  'Determiner',
  NULL,
  'Includes articles and other determiners; imported from ESL Lounge det classifications.'
)
ON CONFLICT (code) DO NOTHING;

CREATE TEMP TABLE _esl_determiner_entries (
  catalogue_entry_id bigint PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO _esl_determiner_entries (catalogue_entry_id)
SELECT entry.id
FROM catalogue_entries entry
JOIN catalogue_entry_parts_of_speech entry_pos
  ON entry_pos.catalogue_entry_id = entry.id
WHERE entry.source_code = 'esl_lounge'
  AND entry_pos.part_of_speech_code = 'article';

INSERT INTO catalogue_entry_parts_of_speech
  (catalogue_entry_id, part_of_speech_code)
SELECT catalogue_entry_id, 'determiner'
FROM _esl_determiner_entries
ON CONFLICT DO NOTHING;

DELETE FROM catalogue_entry_parts_of_speech entry_pos
USING _esl_determiner_entries entry
WHERE entry_pos.catalogue_entry_id = entry.catalogue_entry_id
  AND entry_pos.part_of_speech_code = 'article';

UPDATE catalogue_entries catalogue_entry
SET source_metadata = jsonb_set(
      catalogue_entry.source_metadata,
      '{partOfSpeech}',
      '"determiner"'::jsonb,
      true
    ),
    updated_at = now()
FROM _esl_determiner_entries entry
WHERE catalogue_entry.id = entry.catalogue_entry_id;

UPDATE source_import_records source_record
SET raw_scheduling = jsonb_set(
      source_record.raw_scheduling,
      '{partOfSpeech}',
      '"determiner"'::jsonb,
      true
    ),
    updated_at = now()
FROM source_import_record_catalogue_entries source_link
JOIN _esl_determiner_entries entry
  ON entry.catalogue_entry_id = source_link.catalogue_entry_id
WHERE source_record.id = source_link.source_import_record_id
  AND source_record.source_system = 'esl_lounge';

INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code)
SELECT DISTINCT sense.id, 'determiner'
FROM senses sense
JOIN source_import_records source_record
  ON source_record.id = sense.source_import_record_id
JOIN source_import_record_catalogue_entries source_link
  ON source_link.source_import_record_id = source_record.id
JOIN _esl_determiner_entries entry
  ON entry.catalogue_entry_id = source_link.catalogue_entry_id
WHERE source_record.source_system = 'esl_lounge'
ON CONFLICT DO NOTHING;

DELETE FROM sense_parts_of_speech sense_pos
USING senses sense,
      source_import_records source_record,
      source_import_record_catalogue_entries source_link,
      _esl_determiner_entries entry
WHERE sense_pos.sense_id = sense.id
  AND sense_pos.part_of_speech_code = 'article'
  AND source_record.id = sense.source_import_record_id
  AND source_record.source_system = 'esl_lounge'
  AND source_link.source_import_record_id = source_record.id
  AND entry.catalogue_entry_id = source_link.catalogue_entry_id;
