-- Add sort_order column to tours for manual ordering
ALTER TABLE tours ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Initialise sort_order based on current created_at order (newest = lowest number = shown first)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 AS rn
  FROM tours
)
UPDATE tours SET sort_order = ranked.rn FROM ranked WHERE tours.id = ranked.id;

CREATE INDEX IF NOT EXISTS tours_sort_order_idx ON tours (sort_order);
