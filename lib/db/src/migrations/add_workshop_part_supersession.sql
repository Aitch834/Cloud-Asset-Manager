-- Add supersession columns to workshop parts (stock_items)
ALTER TABLE stock_items
  ADD COLUMN IF NOT EXISTS superseded_by_id INTEGER,
  ADD COLUMN IF NOT EXISTS supersession_notes TEXT,
  ADD COLUMN IF NOT EXISTS superseded_at DATE;
