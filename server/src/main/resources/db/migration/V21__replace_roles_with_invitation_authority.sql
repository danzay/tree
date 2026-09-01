CREATE TABLE user_authorities (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  authority text NOT NULL CHECK (authority IN ('manage_invitations')),
  PRIMARY KEY (user_id, authority)
);

INSERT INTO user_authorities (user_id, authority)
SELECT user_id, 'manage_invitations'
FROM user_roles
WHERE role = 'owner';

DELETE FROM SPRING_SESSION;

DROP TABLE user_roles;

ALTER TABLE auth_settings
  DROP COLUMN registration_mode;
