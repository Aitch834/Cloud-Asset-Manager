---
name: Platform config key whitelist
description: Any new platform config key must be registered in PLATFORM_CONFIG_DEFAULTS in admin.ts or the PUT/DELETE routes return 400 "Unknown config key".
---

## Rule
Every platform config key used by the admin portal must be declared in `PLATFORM_CONFIG_DEFAULTS` in `artifacts/api-server/src/routes/admin.ts` (around line 1082). The PUT and DELETE routes check this map and return 400 if the key is absent.

**Why:** The whitelist enforces that only known, intentional keys can be stored — but it also means adding a new config group (e.g. `company.*`) requires updating the defaults object on the API side, not just writing the frontend form.

**How to apply:** When adding new platform config keys on the frontend (CompanySettings, PlatformConfig, etc.), always add matching entries to `PLATFORM_CONFIG_DEFAULTS` in the same change. Each entry needs `label`, `description`, and a `value` default (can be an empty string).
