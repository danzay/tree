ALTER TABLE sense_progress
  DROP CONSTRAINT sense_progress_status_check;

ALTER TABLE user_sense_progress
  DROP CONSTRAINT user_sense_progress_status_check;

ALTER TABLE review_events
  DROP CONSTRAINT review_events_status_before_check,
  DROP CONSTRAINT review_events_status_after_check;

UPDATE sense_progress
SET status = 'to_learn',
    updated_at = now()
WHERE status = 'unmarked';

UPDATE user_sense_progress
SET status = 'to_learn',
    updated_at = now()
WHERE status = 'unmarked';

UPDATE review_events
SET status_before = CASE
      WHEN status_before = 'unmarked' THEN 'to_learn'
      ELSE status_before
    END,
    status_after = CASE
      WHEN status_after = 'unmarked' THEN 'to_learn'
      ELSE status_after
    END
WHERE status_before = 'unmarked'
   OR status_after = 'unmarked';

ALTER TABLE sense_progress
  ADD CONSTRAINT sense_progress_status_check
    CHECK (status IN ('to_learn', 'learning', 'known'));

ALTER TABLE user_sense_progress
  ADD CONSTRAINT user_sense_progress_status_check
    CHECK (status IN ('to_learn', 'learning', 'known'));

ALTER TABLE review_events
  ADD CONSTRAINT review_events_status_before_check
    CHECK (status_before IN ('to_learn', 'learning', 'known')),
  ADD CONSTRAINT review_events_status_after_check
    CHECK (status_after IN ('to_learn', 'learning', 'known'));
