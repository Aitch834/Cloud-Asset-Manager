-- Add Row level above Bay in workshop storage hierarchy
CREATE TABLE IF NOT EXISTS workshop_rows (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row FK on bays (nullable — existing bays stay unassigned)
ALTER TABLE workshop_bays ADD COLUMN IF NOT EXISTS row_id INTEGER REFERENCES workshop_rows(id) ON DELETE SET NULL;

-- Capacity on shelves
ALTER TABLE workshop_shelves ADD COLUMN IF NOT EXISTS capacity TEXT;
