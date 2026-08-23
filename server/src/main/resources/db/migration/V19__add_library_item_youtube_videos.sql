ALTER TABLE library_items
  ADD COLUMN youtube_video_id text;

ALTER TABLE library_items
  ADD CONSTRAINT library_items_youtube_video_id_check
  CHECK (
    youtube_video_id IS NULL
    OR youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'
  );

UPDATE library_items
SET youtube_video_id = CASE slug
  WHEN 'red-gold-the-worlds-most-expensive-spice' THEN 'krNP8RlDsbw'
  WHEN 'what-would-happen-if-everyone-stopped-eating-meat-tomorrow' THEN 'JAyuHIthHco'
END,
updated_at = now()
WHERE slug IN (
  'red-gold-the-worlds-most-expensive-spice',
  'what-would-happen-if-everyone-stopped-eating-meat-tomorrow'
);
