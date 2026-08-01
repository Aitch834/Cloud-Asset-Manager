---
name: New tables must go through a startup migration
description: A raw SQL push script only fixes the dev DB; deployed databases need new tables/RLS created via the api-server startup migration path.
---

When adding a new table or RLS policy, an ad-hoc push script is not enough — it never runs on deployed databases. Also add idempotent DDL (`CREATE TABLE IF NOT EXISTS`, RLS enable/force, `DROP POLICY IF EXISTS` + `CREATE POLICY`) to a startup migration module so every environment converges on boot.

Additionally: any new photo/attachment table must also be resolvable by the authenticated storage download route's ownership lookup, or uploaded files will 403 on view even for authorized users.

**Why:** Deployed databases only ever see DDL that runs at startup; and the storage route denies any object path it cannot map to a farm.

**How to apply:** After a schema change, wire the same DDL into a startup migration, verify by dropping the table locally and restarting the API, and confirm a registered object path is downloadable while an unregistered one is denied.
