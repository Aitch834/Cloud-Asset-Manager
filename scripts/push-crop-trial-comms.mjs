import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Client } = pg;

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

try {
  await client.query(`
    ALTER TABLE crop_trials
      ADD COLUMN IF NOT EXISTS contact_email text,
      ADD COLUMN IF NOT EXISTS contact_phone text;

    CREATE TABLE IF NOT EXISTS crop_trial_communications (
      id serial PRIMARY KEY,
      trial_id integer NOT NULL REFERENCES crop_trials(id) ON DELETE CASCADE,
      farm_id integer NOT NULL REFERENCES farms(id),
      comm_date date NOT NULL,
      comm_type text NOT NULL,
      direction text NOT NULL DEFAULT 'outbound',
      subject text NOT NULL,
      summary text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log("Migration complete.");
} finally {
  await client.end();
}
