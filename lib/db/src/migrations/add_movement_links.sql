-- Link livestock deadweight/mart sales and TB tests to livestock movement records
ALTER TABLE livestock_deadweight_sales ADD COLUMN IF NOT EXISTS movement_id INTEGER REFERENCES livestock_movements(id);
ALTER TABLE livestock_mart_sales ADD COLUMN IF NOT EXISTS movement_id INTEGER REFERENCES livestock_movements(id);
ALTER TABLE tb_tests ADD COLUMN IF NOT EXISTS movement_id INTEGER REFERENCES livestock_movements(id);
