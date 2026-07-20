import pkg from '/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js';
const { Client } = pkg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const stmts = [
  `ALTER TABLE horticulture_crops ADD COLUMN IF NOT EXISTS planting_method text`,
  `ALTER TABLE horticulture_crops ADD COLUMN IF NOT EXISTS quantity_planted numeric(10,0)`,
  `ALTER TABLE horticulture_crops ADD COLUMN IF NOT EXISTS plant_supplier text`,
  `ALTER TABLE horticulture_crops ADD COLUMN IF NOT EXISTS nursery_batch_ref text`,
  `ALTER TABLE horticulture_crops ADD COLUMN IF NOT EXISTS target_yield_kg_ha numeric(10,2)`,
];

for (const sql of stmts) {
  await client.query(sql);
  console.log('OK:', sql);
}

await client.end();
console.log('Migration complete.');
