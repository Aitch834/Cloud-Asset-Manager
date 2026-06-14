-- Step 1: Create crop_varieties table
CREATE TABLE IF NOT EXISTS crop_varieties (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  farm_id INTEGER NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  variety TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Seed one variety row per existing crop row (preserving variety value and created_at)
INSERT INTO crop_varieties (crop_id, farm_id, variety, created_at)
SELECT id, farm_id, variety, created_at FROM crops
ON CONFLICT DO NOTHING;

-- Step 3: Add variety_id column (nullable first to allow UPDATE)
ALTER TABLE field_crop_assignments ADD COLUMN IF NOT EXISTS variety_id INTEGER REFERENCES crop_varieties(id);

-- Step 4: Populate variety_id: each old crop_id maps to the crop_varieties row where crop_id = old crop_id
UPDATE field_crop_assignments fca
SET variety_id = cv.id
FROM crop_varieties cv
WHERE cv.crop_id = fca.crop_id
  AND fca.variety_id IS NULL;

-- Step 5: Make variety_id NOT NULL (safe once all rows are populated)
ALTER TABLE field_crop_assignments ALTER COLUMN variety_id SET NOT NULL;

-- Step 6: Drop old crop_id from field_crop_assignments
ALTER TABLE field_crop_assignments DROP COLUMN IF EXISTS crop_id;

-- Step 7: Drop variety from crops (data now in crop_varieties)
ALTER TABLE crops DROP COLUMN IF EXISTS variety;
