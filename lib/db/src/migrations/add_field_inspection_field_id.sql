ALTER TABLE field_inspections ADD COLUMN IF NOT EXISTS field_id INTEGER REFERENCES fields(id);
