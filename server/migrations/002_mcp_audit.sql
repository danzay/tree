CREATE TABLE assistant_changes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE RESTRICT,
  client text NOT NULL CHECK (client IN ('local_mcp')),
  tool_name text NOT NULL CHECK (tool_name ~ '^[a-z_]+$'),
  before_data jsonb NOT NULL,
  after_data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX assistant_changes_sense_time_idx
  ON assistant_changes (sense_id, created_at DESC);

CREATE UNIQUE INDEX sense_collocations_normalized_text_idx
  ON sense_collocations (sense_id, lower(text));
