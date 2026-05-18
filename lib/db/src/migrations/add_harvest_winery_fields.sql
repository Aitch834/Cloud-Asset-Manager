ALTER TABLE vineyard_harvest
  ADD COLUMN IF NOT EXISTS destination_winery_type TEXT,
  ADD COLUMN IF NOT EXISTS destination_winery_contact_id INTEGER;
