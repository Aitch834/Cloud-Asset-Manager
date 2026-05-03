-- Staff secondary department memberships (many-to-many)
-- departmentId on farm_members remains the PRIMARY department.
-- This table records any additional departments a person also works in.
CREATE TABLE IF NOT EXISTS staff_department_memberships (
  id            SERIAL PRIMARY KEY,
  member_id     INTEGER NOT NULL REFERENCES farm_members(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES farm_departments(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, department_id)
);
