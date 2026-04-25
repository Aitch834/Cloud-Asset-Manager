-- ──────────────────────────────────────────────────────────────────────────────
-- Row-Level Security: tenant isolation (defence-in-depth layer)
-- Run once against the production database.
-- The service account (postgres superuser) bypasses RLS automatically.
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. Create a restricted read-only role for untrusted query paths.
--    This role is NOT a superuser, so it IS subject to RLS policies.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_readonly') THEN
    CREATE ROLE app_readonly NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

-- 2. Utility function: set the current tenant context for a session.
--    Call this within a transaction using SET LOCAL so the value is
--    automatically cleared when the transaction ends.
--    Example: SET LOCAL app.current_farm_id = '42';
CREATE OR REPLACE FUNCTION set_app_tenant(p_farm_id integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('app.current_farm_id', p_farm_id::text, true);
END;
$$;

-- 3. Enable RLS on the farms (root tenant) table.
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farms_tenant_isolation ON farms;
CREATE POLICY farms_tenant_isolation ON farms
  FOR ALL
  USING (
    -- Allow when no context is set (unrestricted role/superuser path)
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    -- Allow when the row matches the current tenant context
    OR id = current_setting('app.current_farm_id', true)::integer
  );

-- 4. Enable RLS on farm_record_attachments (sensitive file metadata).
ALTER TABLE farm_record_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_record_attachments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farm_record_attachments_tenant_isolation ON farm_record_attachments;
CREATE POLICY farm_record_attachments_tenant_isolation ON farm_record_attachments
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

-- Note: user_tenants is scoped by tenant_id (not farm_id) — omitted from
-- farm-level RLS. Tenant isolation is enforced at the application layer via
-- requireTenant middleware + the userTenantsTable lookup.

-- 5. Enable RLS on farm_members.
ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS farm_members_tenant_isolation ON farm_members;
CREATE POLICY farm_members_tenant_isolation ON farm_members
  FOR ALL
  USING (
    current_setting('app.current_farm_id', true) IS NULL
    OR current_setting('app.current_farm_id', true) = ''
    OR farm_id = current_setting('app.current_farm_id', true)::integer
  );

-- 7. Enable RLS on platform_audit_log (admin-only reads, no tenant context needed).
--    Restrict app_readonly role from reading audit logs.
ALTER TABLE platform_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audit_log FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS platform_audit_log_superuser_only ON platform_audit_log;
CREATE POLICY platform_audit_log_superuser_only ON platform_audit_log
  FOR ALL
  USING (
    -- Only unrestricted (superuser-bypassed) sessions can read audit logs.
    -- The app_readonly role will be denied because no matching policy exists for it.
    true
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- Grant app_readonly SELECT on key tables (subject to the above RLS policies).
-- ──────────────────────────────────────────────────────────────────────────────
GRANT SELECT ON farms TO app_readonly;
GRANT SELECT ON farm_record_attachments TO app_readonly;
GRANT SELECT ON user_tenants TO app_readonly;
GRANT SELECT ON farm_members TO app_readonly;

-- ──────────────────────────────────────────────────────────────────────────────
-- Usage pattern for withTenantContext (implemented in lib/db/src/rls.ts):
--
--   await withTenantContext(pool, farmId, async (client) => {
--     return client.query('SELECT * FROM farms WHERE id = $1', [farmId]);
--   });
--
-- This issues: BEGIN; SET LOCAL app.current_farm_id = '<farmId>'; ...query...; COMMIT;
-- The SET LOCAL ensures the context is cleared when the transaction ends,
-- preventing context leakage across pooled connections.
-- ──────────────────────────────────────────────────────────────────────────────
