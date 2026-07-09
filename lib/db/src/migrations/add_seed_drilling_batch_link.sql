ALTER TABLE seed_drilling_records ADD COLUMN IF NOT EXISTS seed_batch_id integer REFERENCES seed_batches(id) ON DELETE SET NULL;
ALTER TABLE seed_drilling_records ADD COLUMN IF NOT EXISTS stock_consumed_kg numeric(10,2);
