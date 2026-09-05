UPDATE senses
SET review_status = 'imported',
    updated_at = now()
WHERE cefr_level = 'C2'
  AND review_status = 'needs_review';
