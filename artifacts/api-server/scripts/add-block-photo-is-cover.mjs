/**
 * One-off migration: add is_cover column to vineyard_block_photos
 * Run with: node artifacts/api-server/scripts/add-block-photo-is-cover.mjs
 */
import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const sql = `
  ALTER TABLE vineyard_block_photos
    ADD COLUMN IF NOT EXISTS is_cover boolean NOT NULL DEFAULT false;
`;

await client.query(sql);
console.log("✓ is_cover column added (or already existed)");
await client.end();
