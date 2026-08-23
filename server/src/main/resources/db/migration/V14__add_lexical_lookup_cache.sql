CREATE TABLE lexical_lookup_cache (
  normalized_term text NOT NULL CHECK (btrim(normalized_term) <> ''),
  target_language text NOT NULL
    CHECK (target_language ~ '^[a-z]{2,3}(-[A-Za-z0-9]+)*$'),
  part_of_speech_hint text NOT NULL DEFAULT '',
  payload jsonb NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (normalized_term, target_language, part_of_speech_hint),
  CHECK (expires_at > retrieved_at)
);

CREATE INDEX lexical_lookup_cache_expiry_idx
  ON lexical_lookup_cache (expires_at);

-- restored-checksum:6e1f1107
