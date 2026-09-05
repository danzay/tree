ALTER TABLE sense_progress
  DROP CONSTRAINT sense_progress_status_check,
  DROP CONSTRAINT sense_progress_status_origin_check,
  ADD COLUMN learning_stage text;

ALTER TABLE user_sense_progress
  DROP CONSTRAINT user_sense_progress_status_check,
  DROP CONSTRAINT user_sense_progress_status_origin_check,
  ADD COLUMN learning_stage text;

ALTER TABLE review_events
  DROP CONSTRAINT review_events_status_before_check,
  DROP CONSTRAINT review_events_status_after_check;

UPDATE sense_progress
SET status = CASE status
      WHEN 'new' THEN 'unmarked'
      WHEN 'reviewing' THEN 'learning'
      WHEN 'learned' THEN 'known'
      WHEN 'suspended' THEN 'unmarked'
      ELSE status
    END,
    status_origin = CASE
      WHEN status = 'learned' THEN 'system'
      WHEN status = 'known' THEN 'manual'
      WHEN status_origin = 'manual' THEN 'manual'
      ELSE 'system'
    END,
    learning_stage = CASE status
      WHEN 'learning' THEN 'acquiring'
      WHEN 'reviewing' THEN 'reviewing'
      ELSE NULL
    END,
    started_at = CASE
      WHEN status IN ('new', 'suspended') THEN NULL
      ELSE started_at
    END,
    learned_at = CASE
      WHEN status = 'learned' THEN learned_at
      ELSE NULL
    END,
    last_reviewed_at = CASE
      WHEN status IN ('new', 'suspended') THEN NULL
      ELSE last_reviewed_at
    END,
    updated_at = now();

UPDATE user_sense_progress
SET status = CASE status
      WHEN 'new' THEN 'unmarked'
      WHEN 'reviewing' THEN 'learning'
      WHEN 'learned' THEN 'known'
      WHEN 'suspended' THEN 'unmarked'
      ELSE status
    END,
    status_origin = CASE
      WHEN status = 'learned' THEN 'system'
      WHEN status = 'known' THEN 'manual'
      WHEN status_origin = 'manual' THEN 'manual'
      ELSE 'system'
    END,
    learning_stage = CASE status
      WHEN 'learning' THEN 'acquiring'
      WHEN 'reviewing' THEN 'reviewing'
      ELSE NULL
    END,
    started_at = CASE
      WHEN status IN ('new', 'suspended') THEN NULL
      ELSE started_at
    END,
    learned_at = CASE
      WHEN status = 'learned' THEN learned_at
      ELSE NULL
    END,
    last_reviewed_at = CASE
      WHEN status IN ('new', 'suspended') THEN NULL
      ELSE last_reviewed_at
    END,
    updated_at = now();

UPDATE review_events
SET status_before = CASE status_before
      WHEN 'new' THEN 'unmarked'
      WHEN 'reviewing' THEN 'learning'
      WHEN 'learned' THEN 'known'
      WHEN 'suspended' THEN 'unmarked'
      ELSE status_before
    END,
    status_after = CASE status_after
      WHEN 'new' THEN 'unmarked'
      WHEN 'reviewing' THEN 'learning'
      WHEN 'learned' THEN 'known'
      WHEN 'suspended' THEN 'unmarked'
      ELSE status_after
    END;

ALTER TABLE sense_progress
  ADD CONSTRAINT sense_progress_status_check
    CHECK (status IN ('unmarked', 'learning', 'known')),
  ADD CONSTRAINT sense_progress_status_origin_check
    CHECK (status_origin IN ('system', 'manual')),
  ADD CONSTRAINT sense_progress_learning_stage_check
    CHECK (
      (status = 'learning' AND learning_stage IN ('acquiring', 'reviewing'))
      OR (status <> 'learning' AND learning_stage IS NULL)
    );

ALTER TABLE user_sense_progress
  ADD CONSTRAINT user_sense_progress_status_check
    CHECK (status IN ('unmarked', 'learning', 'known')),
  ADD CONSTRAINT user_sense_progress_status_origin_check
    CHECK (status_origin IN ('system', 'manual')),
  ADD CONSTRAINT user_sense_progress_learning_stage_check
    CHECK (
      (status = 'learning' AND learning_stage IN ('acquiring', 'reviewing'))
      OR (status <> 'learning' AND learning_stage IS NULL)
    );

ALTER TABLE review_events
  ADD CONSTRAINT review_events_status_before_check
    CHECK (status_before IN ('unmarked', 'learning', 'known')),
  ADD CONSTRAINT review_events_status_after_check
    CHECK (status_after IN ('unmarked', 'learning', 'known'));

COMMENT ON COLUMN sense_progress.learning_stage IS
  'Internal learning phase; separate from the user-facing learning status.';

COMMENT ON COLUMN user_sense_progress.learning_stage IS
  'Internal learning phase; separate from the user-facing learning status.';
