import pg from "/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg/lib/index.js";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = `
-- farm_task_assignments: resource requirements + time slots
ALTER TABLE farm_task_assignments
  ADD COLUMN IF NOT EXISTS start_time        text,
  ADD COLUMN IF NOT EXISTS end_time          text,
  ADD COLUMN IF NOT EXISTS req_tractors      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_implements    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_vehicles      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_sprayers      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_trailers      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_staff         integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_other         integer NOT NULL DEFAULT 0;

-- farm_planner_events: duration + resource requirements + time slots
ALTER TABLE farm_planner_events
  ADD COLUMN IF NOT EXISTS estimated_duration_hours numeric(5,2),
  ADD COLUMN IF NOT EXISTS start_time               text,
  ADD COLUMN IF NOT EXISTS end_time                 text,
  ADD COLUMN IF NOT EXISTS req_tractors             integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_implements           integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_vehicles             integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_sprayers             integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_trailers             integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_staff                integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS req_other                integer NOT NULL DEFAULT 0;

-- farm_task_resource_allocations: time slots + optional task_assignment_id link
ALTER TABLE farm_task_resource_allocations
  ADD COLUMN IF NOT EXISTS start_time          text,
  ADD COLUMN IF NOT EXISTS end_time            text,
  ADD COLUMN IF NOT EXISTS task_assignment_id  integer REFERENCES farm_task_assignments(id) ON DELETE SET NULL;
`;

try {
  await pool.query(sql);
  console.log("✅ Resource planner migration complete.");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
