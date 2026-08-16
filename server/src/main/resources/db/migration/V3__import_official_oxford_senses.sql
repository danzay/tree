-- Promote the 57 verified Oxford word-list gaps into the main catalogue.
-- Three labels contain multiple official dictionary entries, producing 60 senses.

CREATE TEMP TABLE _official_oxford_senses (
  source_id bigint PRIMARY KEY,
  official_label text NOT NULL,
  word text NOT NULL,
  cefr_level text NOT NULL,
  oxford_list text NOT NULL,
  part_of_speech_code text NOT NULL,
  definition_path text NOT NULL
) ON COMMIT DROP;

INSERT INTO _official_oxford_senses
  (source_id, official_label, word, cefr_level, oxford_list, part_of_speech_code, definition_path)
VALUES
  (1, 'alternative', 'alternative', 'B1', 'Oxford 3000', 'adjective', '/definition/english/alternative_2'),
  (2, 'attorney', 'attorney', 'C1', 'Oxford 5000', 'noun', '/definition/english/attorney'),
  (3, 'behalf', 'behalf', 'C1', 'Oxford 5000', 'noun', '/definition/english/behalf'),
  (4, 'better', 'better', 'B1', 'Oxford 3000', 'noun', '/definition/english/better_3'),
  (5, 'but', 'but', 'B2', 'Oxford 3000', 'preposition', '/definition/english/but_2'),
  (6, 'by', 'by', 'B1', 'Oxford 3000', 'adverb', '/definition/english/by_2'),
  (7, 'centre', 'centre', 'B1', 'Oxford 3000', 'verb', '/definition/english/centre_2'),
  (8, 'cheap', 'cheap', 'B1', 'Oxford 3000', 'adverb', '/definition/english/cheap_2'),
  (9, 'criminal', 'criminal', 'B1', 'Oxford 3000', 'adjective', '/definition/english/criminal_2'),
  (10, 'daily', 'daily', 'B1', 'Oxford 3000', 'adverb', '/definition/english/daily_2'),
  (11, 'deep', 'deep', 'B1', 'Oxford 3000', 'adverb', '/definition/english/deep_2'),
  (12, 'double', 'double', 'B1', 'Oxford 3000', 'adverb', '/definition/english/double_5'),
  (13, 'except', 'except', 'B1', 'Oxford 3000', 'conjunction', '/definition/english/except_2'),
  (14, 'extra', 'extra', 'B1', 'Oxford 3000', 'adverb', '/definition/english/extra_3'),
  (15, 'extra', 'extra', 'B1', 'Oxford 3000', 'noun', '/definition/english/extra_2'),
  (16, 'extreme', 'extreme', 'B2', 'Oxford 3000', 'noun', '/definition/english/extreme_2'),
  (17, 'far', 'far', 'B1', 'Oxford 3000', 'adjective', '/definition/english/far_2'),
  (18, 'feel', 'feel', 'B2', 'Oxford 3000', 'noun', '/definition/english/feel_2'),
  (19, 'fit', 'fit', 'C1', 'Oxford 5000', 'noun', '/definition/english/fit_3'),
  (20, 'forward', 'forward', 'B2', 'Oxford 3000', 'adjective', '/definition/english/forward_2'),
  (21, 'further', 'further', 'B1', 'Oxford 3000', 'adverb', '/definition/english/further_2'),
  (22, 'ideal', 'ideal', 'B2', 'Oxford 3000', 'noun', '/definition/english/ideal_2'),
  (23, 'key', 'key', 'B1', 'Oxford 3000', 'verb', '/definition/english/key_3'),
  (24, 'lead1', 'lead', 'B1', 'Oxford 3000', 'noun', '/definition/english/lead1_2#lead_hm1_sng_21'),
  (25, 'lie2 (tell a lie)', 'lie', 'B1', 'Oxford 3000', 'verb', '/definition/english/lie2_1'),
  (26, 'lie2 (tell a lie)', 'lie', 'B1', 'Oxford 3000', 'noun', '/definition/english/lie2_2'),
  (27, 'like (find sb/sth pleasant)', 'like', 'B1', 'Oxford 3000', 'noun', '/definition/english/like_4'),
  (28, 'low', 'low', 'B2', 'Oxford 3000', 'noun', '/definition/english/low_3'),
  (29, 'material', 'material', 'B2', 'Oxford 3000', 'adjective', '/definition/english/material_2'),
  (30, 'minute2', 'minute', 'C1', 'Oxford 5000', 'adjective', '/definition/english/minute2'),
  (31, 'mistake', 'mistake', 'B2', 'Oxford 3000', 'verb', '/definition/english/mistake_2'),
  (32, 'musical', 'musical', 'B1', 'Oxford 3000', 'noun', '/definition/english/musical_2'),
  (33, 'need', 'need', 'B1', 'Oxford 3000', 'verb', '/definition/english/need_3'),
  (34, 'negative', 'negative', 'B2', 'Oxford 3000', 'noun', '/definition/english/negative_2'),
  (35, 'neither', 'neither', 'B1', 'Oxford 3000', 'adverb', '/definition/english/neither_2'),
  (36, 'next', 'next', 'B1', 'Oxford 3000', 'noun', '/definition/english/next_3'),
  (37, 'now', 'now', 'B1', 'Oxford 3000', 'conjunction', '/definition/english/now_2'),
  (38, 'once', 'once', 'B1', 'Oxford 3000', 'conjunction', '/definition/english/once_2'),
  (39, 'original', 'original', 'B1', 'Oxford 3000', 'noun', '/definition/english/original_2'),
  (40, 'professional', 'professional', 'B2', 'Oxford 3000', 'noun', '/definition/english/professional_2'),
  (41, 'pull', 'pull', 'B1', 'Oxford 3000', 'noun', '/definition/english/pull_2'),
  (42, 'reporting', 'reporting', 'B2', 'Oxford 5000', 'noun', '/definition/english/reporting'),
  (43, 'ring2', 'ring', 'B1', 'Oxford 3000', 'noun', '/definition/english/ring2_2'),
  (44, 'round', 'round', 'B2', 'Oxford 3000', 'noun', '/definition/english/round_4'),
  (45, 'routine', 'routine', 'B2', 'Oxford 3000', 'adjective', '/definition/english/routine_2'),
  (46, 'since', 'since', 'B1', 'Oxford 3000', 'adverb', '/definition/english/since_3'),
  (47, 'slow', 'slow', 'B1', 'Oxford 3000', 'verb', '/definition/english/slow_2'),
  (48, 'sound', 'sound', 'C1', 'Oxford 5000', 'adjective', '/definition/english/sound_3'),
  (49, 'spring', 'spring', 'B1', 'Oxford 3000', 'verb', '/definition/english/spring_2'),
  (50, 'still', 'still', 'B1', 'Oxford 3000', 'adjective', '/definition/english/still_2'),
  (51, 'subject', 'subject', 'B2', 'Oxford 3000', 'adjective', '/definition/english/subject_2'),
  (52, 'suite', 'suite', 'C1', 'Oxford 5000', 'noun', '/definition/english/suite'),
  (53, 'super', 'super', 'B2', 'Oxford 5000', 'adjective', '/definition/english/super_1'),
  (54, 'top', 'top', 'C1', 'Oxford 5000', 'verb', '/definition/english/top_3'),
  (55, 'while', 'while', 'B1', 'Oxford 3000', 'noun', '/definition/english/while_2'),
  (56, 'whole', 'whole', 'B1', 'Oxford 3000', 'noun', '/definition/english/whole_2'),
  (57, 'wrong', 'wrong', 'B1', 'Oxford 3000', 'adverb', '/definition/english/wrong_2'),
  (58, 'wrong', 'wrong', 'B2', 'Oxford 3000', 'noun', '/definition/english/wrong_3'),
  (59, 'yet', 'yet', 'B2', 'Oxford 3000', 'conjunction', '/definition/english/yet_2'),
  (60, 'young', 'young', 'B1', 'Oxford 3000', 'noun', '/definition/english/young_2');

CREATE TEMP TABLE _official_import_run (id bigint PRIMARY KEY) ON COMMIT DROP;

WITH inserted_run AS (
  INSERT INTO import_runs
    (source_type, source_filename, source_sha256, importer_version, status,
     source_records, senses_written, rejected_count, details)
  VALUES
    ('official_oxford_wordlist',
     'The_Oxford_3000_by_CEFR_level.pdf + The_Oxford_5000_by_CEFR_level.pdf',
     '4d393767fc34827bfc632bea07c4d2255a1ac5c27ed9b0b01209121667e972d0',
     '1.0.0', 'running', 60, 60, 0,
     jsonb_build_object(
       'officialLabels', 57,
       'officialSenses', 60,
       'canonicalSpellings', 57,
       'checkedAt', '2026-08-14',
       'sourceUrl', 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000'
     ))
  RETURNING id
)
INSERT INTO _official_import_run (id)
SELECT id FROM inserted_run;

INSERT INTO source_import_records
  (import_run_id, source_system, source_id, source_word, source_translation,
   source_pos_code, inferred_status, raw_scheduling)
SELECT run.id,
       'oxford_official_wordlist',
       seed.source_id,
       seed.word,
       NULL,
       NULL,
       'new',
       jsonb_build_object(
         'officialLabel', seed.official_label,
         'oxfordList', seed.oxford_list,
         'cefrLevel', seed.cefr_level,
         'partOfSpeech', seed.part_of_speech_code,
         'definitionUrl', 'https://www.oxfordlearnersdictionaries.com' || seed.definition_path,
         'wordListUrl', 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000',
         'checkedAt', '2026-08-14',
         'contentIncomplete', true
       )
FROM _official_oxford_senses seed
CROSS JOIN _official_import_run run
ON CONFLICT (source_system, source_id) DO UPDATE SET
  import_run_id = EXCLUDED.import_run_id,
  source_word = EXCLUDED.source_word,
  source_translation = EXCLUDED.source_translation,
  source_pos_code = EXCLUDED.source_pos_code,
  inferred_status = EXCLUDED.inferred_status,
  raw_scheduling = EXCLUDED.raw_scheduling,
  updated_at = now();

INSERT INTO headwords (word, normalized_word)
SELECT DISTINCT word, lower(btrim(word))
FROM _official_oxford_senses
ON CONFLICT (normalized_word) DO UPDATE SET
  word = EXCLUDED.word,
  updated_at = now();

WITH ranked AS (
  SELECT seed.*,
         h.id AS headword_id,
         source.id AS source_import_record_id,
         COALESCE(existing.max_order, 0)
           + row_number() OVER (PARTITION BY h.id ORDER BY seed.source_id) AS sense_order
  FROM _official_oxford_senses seed
  JOIN headwords h ON h.normalized_word = lower(btrim(seed.word))
  JOIN source_import_records source
    ON source.source_system = 'oxford_official_wordlist'
   AND source.source_id = seed.source_id
  LEFT JOIN LATERAL (
    SELECT max(sense_order) AS max_order
    FROM senses
    WHERE headword_id = h.id
  ) existing ON true
)
INSERT INTO senses
  (headword_id, source_import_record_id, definition_en, transcription,
   cefr_level, sense_order, review_status)
SELECT headword_id,
       source_import_record_id,
       NULL,
       NULL,
       cefr_level,
       sense_order,
       'verified'
FROM ranked
ON CONFLICT (source_import_record_id, cefr_level) DO UPDATE SET
  headword_id = EXCLUDED.headword_id,
  cefr_level = EXCLUDED.cefr_level,
  review_status = EXCLUDED.review_status,
  updated_at = now();

INSERT INTO sense_parts_of_speech (sense_id, part_of_speech_code)
SELECT sense.id, seed.part_of_speech_code
FROM _official_oxford_senses seed
JOIN source_import_records source
  ON source.source_system = 'oxford_official_wordlist'
 AND source.source_id = seed.source_id
JOIN senses sense
  ON sense.source_import_record_id = source.id
 AND sense.cefr_level = seed.cefr_level
ON CONFLICT DO NOTHING;

INSERT INTO sense_sources (sense_id, source_import_record_id, source_category)
SELECT sense.id,
       source.id,
       lower(replace(seed.oxford_list, ' ', '')) || '_' || lower(seed.cefr_level) || '_official'
FROM _official_oxford_senses seed
JOIN source_import_records source
  ON source.source_system = 'oxford_official_wordlist'
 AND source.source_id = seed.source_id
JOIN senses sense
  ON sense.source_import_record_id = source.id
 AND sense.cefr_level = seed.cefr_level
ON CONFLICT (sense_id, source_category) DO UPDATE SET
  source_import_record_id = EXCLUDED.source_import_record_id;

INSERT INTO sense_progress (sense_id, status, status_origin)
SELECT sense.id, 'new', 'system'
FROM source_import_records source
JOIN senses sense ON sense.source_import_record_id = source.id
WHERE source.source_system = 'oxford_official_wordlist'
ON CONFLICT (sense_id) DO NOTHING;

DELETE FROM reconciliation_items
WHERE issue_type = 'official_gap';

UPDATE import_runs
SET status = 'completed', completed_at = now()
WHERE id = (SELECT id FROM _official_import_run);
