CREATE TABLE languages (
  code text PRIMARY KEY CHECK (code ~ '^[a-z]{2,3}(-[A-Za-z0-9]+)*$'),
  name text NOT NULL CHECK (btrim(name) <> ''),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE import_runs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_type text NOT NULL CHECK (btrim(source_type) <> ''),
  source_filename text NOT NULL CHECK (btrim(source_filename) <> ''),
  source_sha256 text NOT NULL CHECK (source_sha256 ~ '^[0-9a-f]{64}$'),
  importer_version text NOT NULL CHECK (btrim(importer_version) <> ''),
  status text NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  source_records integer,
  senses_written integer,
  rejected_count integer NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE headwords (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  word text NOT NULL CHECK (btrim(word) <> ''),
  normalized_word text NOT NULL UNIQUE CHECK (btrim(normalized_word) <> ''),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE source_import_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  import_run_id bigint NOT NULL REFERENCES import_runs(id) ON DELETE RESTRICT,
  source_system text NOT NULL CHECK (btrim(source_system) <> ''),
  source_id bigint NOT NULL,
  source_word text NOT NULL CHECK (btrim(source_word) <> ''),
  source_translation text,
  source_pos_code integer,
  inferred_status text NOT NULL CHECK (inferred_status IN ('new', 'learning', 'learned', 'known')),
  raw_scheduling jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_system, source_id)
);

CREATE TABLE senses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  headword_id bigint NOT NULL REFERENCES headwords(id) ON DELETE RESTRICT,
  source_import_record_id bigint NOT NULL REFERENCES source_import_records(id) ON DELETE RESTRICT,
  definition_en text,
  transcription text,
  cefr_level text NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  sense_order integer NOT NULL DEFAULT 1 CHECK (sense_order > 0),
  review_status text NOT NULL DEFAULT 'imported'
    CHECK (review_status IN ('imported', 'verified', 'needs_review')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_import_record_id, cefr_level)
);

CREATE TABLE sense_sources (
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  source_import_record_id bigint NOT NULL REFERENCES source_import_records(id) ON DELETE RESTRICT,
  source_category text NOT NULL CHECK (btrim(source_category) <> ''),
  PRIMARY KEY (sense_id, source_category)
);

CREATE TABLE parts_of_speech (
  code text PRIMARY KEY CHECK (code ~ '^[a-z_]+$'),
  display_name text NOT NULL CHECK (btrim(display_name) <> ''),
  source_bit integer UNIQUE CHECK (source_bit > 0),
  notes text
);

CREATE TABLE sense_parts_of_speech (
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  part_of_speech_code text NOT NULL REFERENCES parts_of_speech(code) ON DELETE RESTRICT,
  PRIMARY KEY (sense_id, part_of_speech_code)
);

CREATE TABLE sense_translations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES languages(code) ON DELETE RESTRICT,
  translation text NOT NULL CHECK (btrim(translation) <> ''),
  position integer NOT NULL DEFAULT 1 CHECK (position > 0),
  UNIQUE (sense_id, language_code, position)
);

CREATE TABLE sense_collocations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  text text NOT NULL CHECK (btrim(text) <> ''),
  position integer NOT NULL CHECK (position > 0),
  source text,
  UNIQUE (sense_id, position)
);

CREATE TABLE sense_examples (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE CASCADE,
  sentence text NOT NULL CHECK (btrim(sentence) <> ''),
  position integer NOT NULL CHECK (position > 0),
  UNIQUE (sense_id, position)
);

CREATE TABLE example_translations (
  example_id bigint NOT NULL REFERENCES sense_examples(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES languages(code) ON DELETE RESTRICT,
  translation text NOT NULL CHECK (btrim(translation) <> ''),
  PRIMARY KEY (example_id, language_code)
);

CREATE TABLE sense_progress (
  sense_id bigint PRIMARY KEY REFERENCES senses(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('new', 'learning', 'reviewing', 'learned', 'known', 'suspended')),
  status_origin text NOT NULL CHECK (status_origin IN ('imported', 'system', 'manual', 'unresolved')),
  started_at timestamptz,
  learned_at timestamptz,
  last_reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE review_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_event_id uuid NOT NULL UNIQUE,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE RESTRICT,
  exercise_type text NOT NULL CHECK (btrim(exercise_type) <> ''),
  result text NOT NULL CHECK (btrim(result) <> ''),
  status_before text NOT NULL CHECK (status_before IN ('new', 'learning', 'reviewing', 'learned', 'known', 'suspended')),
  status_after text NOT NULL CHECK (status_after IN ('new', 'learning', 'reviewing', 'learned', 'known', 'suspended')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  scheduler_data jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE reconciliation_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_key text NOT NULL UNIQUE CHECK (btrim(source_key) <> ''),
  issue_type text NOT NULL CHECK (issue_type IN ('official_gap', 'ambiguous_levels', 'source_anomaly')),
  headword text NOT NULL CHECK (btrim(headword) <> ''),
  official_level text,
  oxford_list text,
  source_import_record_id bigint REFERENCES source_import_records(id) ON DELETE RESTRICT,
  matched_sense_id bigint REFERENCES senses(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  notes text,
  checked_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE import_issues (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  import_run_id bigint NOT NULL REFERENCES import_runs(id) ON DELETE CASCADE,
  source_id bigint,
  severity text NOT NULL CHECK (severity IN ('warning', 'error')),
  issue_code text NOT NULL CHECK (btrim(issue_code) <> ''),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX headwords_word_prefix_idx ON headwords (normalized_word text_pattern_ops);
CREATE INDEX senses_level_idx ON senses (cefr_level, id);
CREATE INDEX senses_headword_idx ON senses (headword_id, sense_order, id);
CREATE INDEX sense_pos_lookup_idx ON sense_parts_of_speech (part_of_speech_code, sense_id);
CREATE INDEX sense_progress_status_idx ON sense_progress (status, sense_id);
CREATE INDEX sense_translations_language_idx ON sense_translations (language_code, sense_id);
CREATE INDEX review_events_sense_time_idx ON review_events (sense_id, occurred_at DESC);
CREATE INDEX reconciliation_status_idx ON reconciliation_items (status, issue_type);
CREATE INDEX import_issues_run_idx ON import_issues (import_run_id, severity);

INSERT INTO languages (code, name) VALUES
  ('en', 'English'),
  ('ru', 'Russian')
ON CONFLICT (code) DO NOTHING;

INSERT INTO parts_of_speech (code, display_name, source_bit, notes) VALUES
  ('noun', 'Noun', 1, 'Verified from source examples'),
  ('verb', 'Verb', 2, 'Verified from source examples'),
  ('adjective', 'Adjective', 4, 'Verified from source examples'),
  ('adverb', 'Adverb', 8, 'Verified from source examples'),
  ('pronoun', 'Pronoun', 16, 'Verified from source examples'),
  ('preposition', 'Preposition', 32, 'Verified from source examples'),
  ('conjunction', 'Conjunction', 64, 'Verified from source examples'),
  ('greeting', 'Greeting', 128, 'Source lexical class; not strictly a part of speech'),
  ('article', 'Article', 256, 'Verified from source examples'),
  ('numeral', 'Numeral', 512, 'Verified from source examples'),
  ('expression', 'Expression or interjection', 1024, 'Source class includes expressions and interjections'),
  ('participle', 'Participle', 2048, 'Inferred from source examples; original bit is retained for audit')
ON CONFLICT (code) DO NOTHING;
