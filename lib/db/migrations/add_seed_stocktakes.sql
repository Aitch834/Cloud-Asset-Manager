CREATE TABLE IF NOT EXISTS seed_stocktakes (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id),
  seed_batch_id INTEGER REFERENCES seed_batches(id),
  location TEXT,
  system_qty_bags INTEGER,
  physical_qty_bags INTEGER NOT NULL,
  conducted_by TEXT,
  stocktake_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
