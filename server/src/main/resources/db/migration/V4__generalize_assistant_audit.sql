ALTER TABLE assistant_changes
  DROP CONSTRAINT IF EXISTS assistant_changes_client_check;

ALTER TABLE assistant_changes
  ADD CONSTRAINT assistant_changes_client_check CHECK (btrim(client) <> '');
