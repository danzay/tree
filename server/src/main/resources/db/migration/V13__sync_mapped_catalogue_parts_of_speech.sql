INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code)
SELECT DISTINCT mapping.sense_id, entry_pos.part_of_speech_code
FROM catalogue_entry_senses mapping
JOIN catalogue_entries entry
  ON entry.id = mapping.catalogue_entry_id
 AND entry.source_code = 'esl_lounge'
JOIN catalogue_entry_parts_of_speech entry_pos
  ON entry_pos.catalogue_entry_id = entry.id
WHERE mapping.match_method = 'manual'
ON CONFLICT DO NOTHING;
