CREATE TABLE IF NOT EXISTS workshop_settings (
  farm_id INTEGER PRIMARY KEY REFERENCES farms(id) ON DELETE CASCADE,
  labour_rate_pence INTEGER NOT NULL DEFAULT 5000,
  labour_charge_unit_minutes INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workshop_labour_entries (
  id SERIAL PRIMARY KEY,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES workshop_jobs(id) ON DELETE CASCADE,
  entry_date TEXT NOT NULL,
  description TEXT,
  charge_units INTEGER NOT NULL DEFAULT 1,
  rate_pence INTEGER NOT NULL,
  cost_pence INTEGER NOT NULL,
  performed_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
