import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(`
    ALTER TABLE winery_pressing_records
      ADD COLUMN IF NOT EXISTS audit_signature text,
      ADD COLUMN IF NOT EXISTS audit_signed_at timestamptz;
  `);
  console.log("Migration complete — audit_signature and audit_signed_at added to winery_pressing_records.");
} finally {
  await client.end();
}
