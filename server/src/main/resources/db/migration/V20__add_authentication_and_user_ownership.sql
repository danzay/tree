CREATE TABLE app_users (
  id uuid PRIMARY KEY,
  email text NOT NULL CHECK (btrim(email) <> ''),
  normalized_email text NOT NULL UNIQUE CHECK (normalized_email = lower(btrim(normalized_email))),
  display_name text NOT NULL CHECK (btrim(display_name) <> ''),
  account_status text NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE user_credentials (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  password_hash text NOT NULL CHECK (btrim(password_hash) <> ''),
  password_changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE external_identities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google')),
  provider_subject text NOT NULL CHECK (btrim(provider_subject) <> ''),
  provider_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_subject),
  UNIQUE (user_id, provider)
);

CREATE TABLE user_roles (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'user')),
  PRIMARY KEY (user_id, role)
);

CREATE TABLE auth_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  registration_mode text NOT NULL DEFAULT 'invite_only'
    CHECK (registration_mode IN ('open', 'invite_only')),
  initial_data_claimed_by uuid REFERENCES app_users(id) ON DELETE RESTRICT,
  updated_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO auth_settings (id) VALUES (1);

CREATE TABLE invitations (
  id uuid PRIMARY KEY,
  normalized_email text NOT NULL CHECK (normalized_email = lower(btrim(normalized_email))),
  token_hash char(64) NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  expires_at timestamptz NOT NULL,
  accepted_by uuid REFERENCES app_users(id) ON DELETE RESTRICT,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((accepted_by IS NULL) = (accepted_at IS NULL))
);

CREATE TABLE auth_audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (btrim(event_type) <> ''),
  outcome text NOT NULL CHECK (outcome IN ('success', 'failure')),
  subject text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE user_sense_progress (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  sense_id bigint NOT NULL REFERENCES senses(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('new', 'learning', 'reviewing', 'learned', 'known', 'suspended')),
  status_origin text NOT NULL CHECK (status_origin IN ('imported', 'system', 'manual', 'unresolved')),
  started_at timestamptz,
  learned_at timestamptz,
  last_reviewed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, sense_id)
);

ALTER TABLE review_events
  ADD COLUMN user_id uuid REFERENCES app_users(id) ON DELETE RESTRICT;

ALTER TABLE library_items
  ADD COLUMN owner_user_id uuid REFERENCES app_users(id) ON DELETE CASCADE;

CREATE TABLE user_library_progress (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  library_item_id bigint NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  reading_status text NOT NULL DEFAULT 'not_started'
    CHECK (reading_status IN ('not_started', 'in_progress', 'completed')),
  last_opened_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, library_item_id)
);

CREATE TABLE SPRING_SESSION (
  PRIMARY_ID char(36) NOT NULL,
  SESSION_ID char(36) NOT NULL,
  CREATION_TIME bigint NOT NULL,
  LAST_ACCESS_TIME bigint NOT NULL,
  MAX_INACTIVE_INTERVAL integer NOT NULL,
  EXPIRY_TIME bigint NOT NULL,
  PRINCIPAL_NAME varchar(100),
  CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);

CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
  SESSION_PRIMARY_ID char(36) NOT NULL,
  ATTRIBUTE_NAME varchar(200) NOT NULL,
  ATTRIBUTE_BYTES bytea NOT NULL,
  CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
  CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID)
    REFERENCES SPRING_SESSION(PRIMARY_ID) ON DELETE CASCADE
);

CREATE INDEX app_users_status_idx ON app_users (account_status, id);
CREATE INDEX external_identities_user_idx ON external_identities (user_id, provider);
CREATE INDEX invitations_email_expiry_idx ON invitations (normalized_email, expires_at DESC);
CREATE INDEX auth_audit_events_user_time_idx ON auth_audit_events (user_id, occurred_at DESC);
CREATE INDEX auth_audit_events_subject_time_idx ON auth_audit_events (subject, occurred_at DESC);
CREATE INDEX user_sense_progress_status_idx
  ON user_sense_progress (user_id, status, sense_id);
CREATE INDEX review_events_user_time_idx
  ON review_events (user_id, occurred_at DESC);
CREATE INDEX library_items_owner_updated_idx
  ON library_items (owner_user_id, updated_at DESC, id DESC);
CREATE INDEX user_library_progress_status_idx
  ON user_library_progress (user_id, reading_status, library_item_id);
