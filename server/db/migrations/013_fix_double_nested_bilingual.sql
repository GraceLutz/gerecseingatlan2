-- ============================================
-- 013: Fix double-nested bilingual JSON in
-- content_blocks. Some rows have hu/en slots
-- containing a stringified bilingual JSON object
-- instead of plain text. This flattens them.
-- Idempotent: safe to re-run.
-- ============================================

-- Fix rows where content->'hu' is itself a JSON string containing 'hu'/'en' keys
UPDATE content_blocks
SET
  content = jsonb_build_object(
    'hu',
    CASE
      WHEN (content::jsonb->>'hu') IS NOT NULL
           AND (content::jsonb->>'hu') ~ '^\s*\{'
           AND ((content::jsonb->>'hu')::jsonb ? 'hu')
      THEN (content::jsonb->>'hu')::jsonb->>'hu'
      ELSE content::jsonb->>'hu'
    END,
    'en',
    CASE
      WHEN (content::jsonb->>'en') IS NOT NULL
           AND (content::jsonb->>'en') ~ '^\s*\{'
           AND ((content::jsonb->>'en')::jsonb ? 'en')
      THEN (content::jsonb->>'en')::jsonb->>'en'
      ELSE content::jsonb->>'en'
    END
  )::text,
  updated_at = NOW()
WHERE
  content ~ '^\s*\{'
  AND (content::jsonb ? 'hu' OR content::jsonb ? 'en')
  AND (
    -- hu slot is double-nested
    (
      (content::jsonb->>'hu') IS NOT NULL
      AND (content::jsonb->>'hu') ~ '^\s*\{'
      AND ((content::jsonb->>'hu')::jsonb ? 'hu')
    )
    OR
    -- en slot is double-nested
    (
      (content::jsonb->>'en') IS NOT NULL
      AND (content::jsonb->>'en') ~ '^\s*\{'
      AND ((content::jsonb->>'en')::jsonb ? 'en')
    )
  );

-- Verification: show sample rows to confirm hu/en values are plain text
SELECT id, page_path, block_key,
       content::jsonb->>'hu' AS hu_value,
       content::jsonb->>'en' AS en_value,
       content_type
FROM content_blocks
WHERE content ~ '^\s*\{' AND (content::jsonb ? 'hu' OR content::jsonb ? 'en')
ORDER BY RANDOM()
LIMIT 10;
