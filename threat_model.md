# Threat Model — BDE Farm Trac

_Last reviewed: 2026-07-12 (updated for LIS LIP OAuth/cattle integration, new stocktake modules, dev bypass middleware verification; security fixes applied — LIP token encryption, admin SQL runner role downgrade, helmet headers, PII log redaction, audit log DB trigger, per-recipient email rate limiting, MODULE_BUNDLES documentation). Update whenever a new module, external integration, or auth change is introduced._

---

## Project Overview

BDE Farm Trac is a multi-tenant UK SaaS farm management platform built by Barnett Davies Enterprises Ltd. It helps farmers achieve Red Tractor scheme compliance by centralising records across crops, livestock, equipment, biosecurity, finance, and regulatory modules.

**Tech stack**

| Layer | Technology |
|---|---|
| API server | Node.js + Express 5 |
| Web dashboards | React + Vite (dashboard, admin portal, website) |
| Mobile | React Native / Expo SDK 54 |
| Database | PostgreSQL via Drizzle ORM (90+ tables) |
| Authentication | Clerk (`@clerk/express`) |
| Object storage | Google Cloud Storage (via Replit object storage sidecar) |
| Payments | Stripe |
| SMS | Twilio |
| Email | Nodemailer outbound + ImapFlow (Titan) inbound |
| AI | OpenAI gpt-5-mini (support chat widget) |
| Gov integrations | BCMS / DEFRA CTS Web Services; LIS / England CLA API; LIS LIP (Cattle, OAuth 2.0 delegated — B2C_1A_THIRDPARTY_SIGNIN) |

**Users**

- Farm owners and managers (web dashboard, full access)
- Farm operators / staff (mobile app, restricted access)
- BDE platform administrators (admin portal, internal only)
- Unauthenticated visitors (public marketing website only)

---

## Assets

| Asset | Why it matters |
|---|---|
| **Farm operational records** | Spray applications, medicine treatments, livestock movements, soil data, finance records — the core product data. Cross-contamination between farms or tenants undermines Red Tractor audit integrity and could expose commercially sensitive data (yield, grain prices, herd health). |
| **Personal data / PII** | Staff names, phone numbers, Right to Work documents, signatures, TB test records. Regulated under UK GDPR. |
| **Clerk session tokens** | Valid tokens grant full dashboard access scoped to the user's tenant and role. |
| **Admin portal secret** | A single shared credential (plus per-user Clerk `isSuperAdmin` flag) granting platform-wide access including SQL execution. Highest-impact credential in the system. |
| **Third-party API credentials** | Twilio SID/token, Stripe secret key, Titan IMAP password, OpenAI API key — stored as environment secrets. Farmer-supplied BCMS (CTS) and LIS passwords — stored encrypted (AES-256-GCM) in the database. LIS LIP OAuth access tokens and refresh tokens — stored **unencrypted** in `lipFarmTokensTable`; grant delegated access to submit cattle movements to DEFRA (see Information Disclosure findings). |
| **Uploaded attachments** | Photos and documents (defect evidence, vet certificates, insurance policies, TB test certificates) stored in Google Cloud Storage. May contain sensitive commercial or personal information. |
| **Database connection string** | Direct database access; compromise gives full data exposure across all tenants. |
| **Stripe billing data** | Subscription status, invoice history. Compromise could allow unauthorized subscription manipulation. |
| **AI chat conversation history** | User messages sent to the OpenAI support widget are relayed to OpenAI's API. Sensitive farm details mentioned by users in chat are processed externally. |

---

## Trust Boundaries

| Boundary | What it separates |
|---|---|
| **Browser / Mobile → API** | All client requests cross here. Clients are untrusted; the API must authenticate and authorise every request. |
| **Tenant boundary** | Enforced by `tenantMiddleware` — a user authenticated to tenant A must never access tenant B's data. This is the primary customer-isolation boundary. |
| **Farm boundary** | Within a tenant, each farm is isolated by `validateFarmAccess` in route handlers (confirmed against `farmsTable.tenantId`), reinforced by `farmRlsMiddleware` which opens a per-request Postgres transaction with `SET LOCAL app.current_farm_id = <farmId>`. RLS policies on all 347 farm-scoped tables enforce this at the DB layer. Policies are currently **fail-open** — when `app.current_farm_id` is not set the policy allows all rows, preserving compatibility while the middleware ramps up. |
| **API → PostgreSQL** | Drizzle ORM with parameterised queries. All 347 farm-scoped tables have RLS enabled. The API superuser connection bypasses RLS implicitly; `farmRlsMiddleware` uses a per-request transaction client to inject the farm context so policies fire. The bare pool connection (used outside `farmRlsMiddleware`) bypasses RLS entirely. |
| **API → Google Cloud Storage** | Private object downloads (`GET /storage/objects/*`) are access-controlled: attachment must exist in `farm_record_attachments`, farm must belong to a tenant, requesting user is a member of that tenant. Public assets (`/storage/public-objects/*`) are unconditionally public — ensure no private content reaches the public path. |
| **API → OpenAI** | Outbound only. User-supplied conversation history is passed to OpenAI's API, capped at 20 messages × 2,000 chars server-side before forwarding. |
| **API → External Gov APIs** | Outbound calls to BCMS/DEFRA and LIS/CLA using farmer-supplied credentials (AES-256-GCM encrypted at rest). Hardcoded endpoint URLs (no SSRF risk). LIS LIP cattle submission calls (movements, births, deaths, lost/found) use per-farm OAuth 2.0 delegated tokens fetched from `lipFarmTokensTable` and refreshed server-side. OAuth redirect URI is a fixed server-side callback (no open-redirect risk). OAuth state parameter is HMAC-SHA256 signed and verified on callback — no DB nonce required. |
| **API → Twilio / Stripe / IMAP** | Outbound only. Stripe inbound webhooks are signature-verified. No other inbound webhooks identified. |
| **Public → Authenticated** | Public API routes: `/api/healthz`, `/api/leads`, `/api/billing/webhook`, `/api/support/tickets`, `/api/support/chat`, `/api/help-images/*`. All others require a valid Clerk session. |
| **Authenticated → Admin** | Admin portal routes (`/api/admin/*`) accept either a valid `x-admin-secret` header OR a Clerk-authenticated session with `isSuperAdmin = true` in `userTenantsTable`. |
| **Mobile → API (offline sync)** | The mobile app queues records in SQLite when offline and submits them on reconnect. Records enter the API with the user's Clerk token; client-supplied `createdAt`/`updatedAt` are stripped server-side and replaced with DB-default `NOW()`. |

---

## Scan Anchors

**Production entry points**
- API middleware stack: `artifacts/api-server/src/app.ts`
- Primary farm data routes: `artifacts/api-server/src/routes/farms.ts`
- Admin routes (highest privilege): `artifacts/api-server/src/routes/admin.ts`
- Public routes: `artifacts/api-server/src/routes/support.ts`, `leads.ts`, `billing.ts`, `storage.ts`
- Mobile-specific routes: `artifacts/api-server/src/routes/mobile.ts`

**Highest-risk code areas**
- `artifacts/api-server/src/routes/farms.ts` — all INSERT/UPDATE routes use `sanitiseBody()` to strip protected fields; includes LIP cattle submission routes
- `artifacts/api-server/src/routes/admin.ts` — SQL runner, IMAP access, audit log writer
- `artifacts/api-server/src/routes/support.ts` — public AI chat (prompt injection) + email-sending ticket endpoint
- `artifacts/api-server/src/lib/objectStorage.ts` — attachment access control
- `artifacts/api-server/src/lib/lip.ts` — LIP cattle API integration (movements, births, deaths, lost/found); reads tokens from `lipFarmTokensTable`
- `artifacts/api-server/src/lib/lis.ts` — LIS OAuth 2.0 flow; handles HMAC-signed state, code exchange, token storage
- `artifacts/api-server/src/middlewares/tenantMiddleware.ts` — tenant isolation gate
- `artifacts/api-server/src/middlewares/adminPortalMiddleware.ts` — admin authentication

**Auth surfaces**
- Protected: all routes under `/api/farms/*` require `requireAuth` + `requireTenant` + `validateFarmAccess`
- Public: `/api/healthz`, `/api/leads`, `/api/support/tickets`, `/api/support/chat`, `/api/billing/webhook`, `/api/help-images/*`
- Admin-only: `/api/admin/*` (shared secret header OR Clerk `isSuperAdmin`)

**Dev-only / ignore in production scans**
- `artifacts/mockup-sandbox/` — design preview server, not production
- `artifacts/test-dashboard/` — internal testing UI with auth bypass; must not be exposed in production

---

## Threat Categories

### Spoofing

Clerk handles authentication for all standard user sessions. `clerkMiddleware()` validates the JWT on every request and `requireAuth` rejects requests without a valid `userId`. This boundary is solid.

**Finding — LIS LIP OAuth 2.0 flow (NEW, MEDIUM) — ACCEPTABLE ✅**
The LIS LIP integration uses a delegated OAuth 2.0 flow (`B2C_1A_THIRDPARTY_SIGNIN` policy). Key security properties confirmed:
- The OAuth `state` parameter is HMAC-SHA256 signed using a server-side key before the redirect and verified on callback — no DB nonce is required and CSRF on the callback is prevented.
- The authorization code is exchanged server-side only; no token is exposed to the browser.
- The redirect URI is hardcoded in the server configuration; there is no user-controllable redirect target (no open-redirect risk).
- LIP submission routes sit under `/api/farms/:farmId/lip/*` and are guarded by `requireAuth` + `requireTenant` + `farmRlsMiddleware`, preventing cross-farm token use.

**Required guarantees:**
- The HMAC signing key for OAuth state MUST be treated as a secret (stored as an environment variable, never hardcoded) and rotated if compromised.
- Any future LIP callback route additions MUST preserve state verification before trusting the returned code.

**Finding — Dev bypass middleware active in production? (LOW) — CONFIRMED SAFE ✅**
`devBypassMiddleware` is registered unconditionally in `app.ts`, but the middleware evaluates `process.env.NODE_ENV` at module load time. When `NODE_ENV !== "development"` the module-level `DEV_BYPASS_TOKEN` constant is set to `null`, and the middleware immediately calls `next()` on every request without inspecting the header. In production the bypass path is dead code.

**Required guarantees:**
- Deployment environment MUST set `NODE_ENV=production`. Confirm this is enforced in the deployment configuration and cannot be overridden by a user-supplied environment variable at runtime.

**Finding — Admin portal shared secret still present alongside Clerk (MEDIUM) — PARTIALLY FIXED**
The admin portal now supports individual Clerk accounts with `isSuperAdmin = true`, which is an improvement over the April model. However, the shared `ADMIN_PORTAL_SECRET` header path still exists alongside it in `adminPortalMiddleware`. Both auth methods remain active. The shared-secret path provides no per-person identity or audit trail.

**Required guarantees:**
- The `ADMIN_PORTAL_SECRET` path should be treated as a bootstrap mechanism only. The target state is all admin access going through individual Clerk accounts with `isSuperAdmin`, with the shared-secret path disabled or IP-restricted at the network level.
- `ADMIN_PORTAL_SECRET` must be rotated immediately if any person with knowledge of it leaves the organisation.
- The audit log (`writeAuditLog`) must be called for all sensitive admin actions — coverage confirmed complete on IMAP delete, SQL runner, config writes, and email sends.

---

### Tampering

**Finding — Mass assignment on INSERT/UPDATE routes (CRITICAL) — FIXED ✅**
Previously, many handlers spread `req.body` directly into Drizzle `.set()` / `.values()` calls, allowing a malicious authenticated user to write protected fields (`tenantId`, `farmId`, `createdAt`, etc.).

**Resolution:** `sanitiseBody()` (`artifacts/api-server/src/lib/sanitise.ts`) is now applied to all INSERT and UPDATE routes in `farms.ts`. It strips `id`, `farmId`, `tenantId`, `createdAt`, `updatedAt`, `deletedAt` (and snake_case variants) from the client body before any database write. The `farmId` is always taken from the validated route parameter, not the client body.

**Finding — AI chat accepts unbounded user-supplied conversation history (MEDIUM) — FIXED ✅**
The `/support/chat` endpoint previously passed the full client-supplied `conversationHistory` array to OpenAI without any server-side bound.

**Resolution:** `conversationHistory` is now capped server-side at the last 20 messages, and each message `content` is truncated to 2,000 characters before forwarding to OpenAI. This prevents cost inflation and limits prompt injection surface.

---

### Repudiation

**Significant improvement since April: `platform_audit_log` table and `writeAuditLog()` helper now exist in `admin.ts`.**

**Finding — Audit log coverage (MEDIUM) — FIXED ✅**
`writeAuditLog()` is confirmed called on: SQL runner executions, IMAP message deletion, platform config writes, and admin email sends. Coverage is complete across all sensitive admin actions.

**Finding — Attachment deletion audit trail (LOW) — FIXED ✅**
Attachment deletion now sets a `deletedAt` flag rather than hard-deleting the row. The `isNull(deletedAt)` filter is applied on all attachment reads. A tombstone record is preserved for audit purposes in line with Red Tractor inspection requirements.

---

### Information Disclosure

**Significant improvement since April: Object storage ACL is now fully enforced.** The private download route (`GET /storage/objects/*`) performs a three-step check: (1) path exists in `farm_record_attachments`, (2) farm belongs to a tenant, (3) requesting user is a member of that tenant. The April HIGH finding is resolved.

**Significant improvement since April: File size and MIME type enforcement is now server-side.** The presigned URL endpoint enforces a 25 MB cap and an explicit MIME type allowlist. The April MEDIUM finding is resolved.

**Finding — Farmer third-party credentials stored without encryption (MEDIUM) — FIXED ✅**
BCMS (CTS) passwords and LIS passwords are now encrypted at rest using AES-256-GCM (`encryptCredential` / `decryptCredential` in `farms.ts`), with the encryption key stored as an environment secret. Decryption occurs only server-side immediately before the outbound API call, and plaintext is never written to logs.

**Finding — LIS LIP OAuth tokens stored unencrypted at rest (MEDIUM) — FIXED ✅**
`platformAccessToken` and `lipRefreshToken` in `lipFarmTokensTable` are now encrypted at rest using AES-256-GCM (`encryptCredential` / `decryptCredential`, `lib/encrypt.ts`), matching the BCMS/LIS credential pattern. A `decryptLipToken()` helper in `farms.ts` handles the transition period: rows with the `enc:v1:` prefix are decrypted; existing plaintext rows are returned as-is and will be re-encrypted on the next token refresh. All 8 `refreshLipToken()` call sites, 8 DB write sites, and the OAuth callback (lines ~26611–27090, ~33769–33770) were patched.

**Finding — User email addresses are accepted without verification on public ticket endpoint (LOW) — PARTIALLY FIXED ✅**
The `/api/support/tickets` endpoint sends a confirmation email to whatever address is submitted in the request body. An attacker could submit another person's email address, causing unsolicited emails from BDE's mail domain.

Per-recipient rate limiting is now enforced: a maximum of 3 confirmation emails per recipient email address per hour is enforced via an in-memory sliding-window counter (`support.ts`). Repeat submissions beyond this cap are still accepted and stored as tickets, but no further confirmation emails are sent to that recipient. Full email address verification (double opt-in) would close this finding entirely but is out of scope for this sprint.

**Finding — IMAP error messages exposed to admin client (LOW) — FIXED ✅**
All IMAP catch blocks in `admin.ts` now log the full error server-side and return only a sanitised human-readable message to the client.

---

### Denial of Service

**Significant improvement since April: Rate limiting is now implemented.**
- Public endpoints (`/api/leads`, `/api/support/tickets`, `/api/support/chat`): 20 requests/IP/minute
- Presigned URL endpoint (`/api/storage/uploads`): 30 requests/user or IP/minute
- All other API routes: 300 requests/user or IP/minute

**Finding — AI chat endpoint rate limit (MEDIUM) — FIXED ✅**
`/api/support/chat` now has its own dedicated `publicLimiter` (20 req/IP/min) applied in `app.ts`, matching the other public endpoints. The existing `max_completion_tokens: 512` response cap is maintained.

---

### Elevation of Privilege

**Finding — Farm-level isolation is application-layer only (MEDIUM) — PARTIALLY FIXED ✅**
`validateFarmAccess` is now confirmed on all farm-scoped routes (400+ handlers audited and patched in `farms.ts`; 5 report routes fixed separately). `farmRlsMiddleware` is registered as `router.use('/farms/:farmId', requireAuth, requireTenant, farmRlsMiddleware)` and runs a per-request Postgres transaction with `set_app_tenant()`. PostgreSQL RLS is enabled on all 347 farm-scoped tables.

**Remaining gap — RLS policies are fail-open:**
The RLS policies currently allow all rows when `app.current_farm_id` is not set. This is intentional for the rollout phase (avoids breaking routes not yet covered by `farmRlsMiddleware`) but means the DB defence-in-depth layer does not fire on every request — `validateFarmAccess` remains the primary gate.

**Required guarantees:**
- Every new route touching farm data MUST call `validateFarmAccess` and scope all subsequent queries by the returned `farmId`.
- Once `farmRlsMiddleware` is confirmed on 100% of farm-scoped routes (in a future audit), flip RLS policies from fail-open (`current_setting IS NULL OR ''`) to fail-closed (require `app.current_farm_id` to be set).
- The bare pool connection (used in background jobs / alerting) bypasses RLS; background jobs MUST call `set_app_tenant()` explicitly if querying farm-scoped data, or be refactored to use per-farm transactions.

**Finding — Admin SQL runner executes as superuser (MEDIUM) — FIXED ✅**
`POST /api/admin/sql` now issues `SET LOCAL ROLE app_readonly` inside the read-only transaction (after `SET TRANSACTION READ ONLY`). `app_readonly` is a NOLOGIN role defined in `rls_tenant_isolation.sql` that is subject to PostgreSQL RLS. The superuser connection is still used to open the transaction, but the role is downgraded for the query execution, so RLS policies apply and cross-tenant row leakage via the runner is prevented. The keyword denylist and 2,000-row cap remain as additional layers.

**Finding — No HTTP security headers (LOW) — FIXED ✅**
`helmet` is now installed and applied in `app.ts` before CORS and all route handlers. The default helmet middleware sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, and `X-XSS-Protection: 0`. A custom `contentSecurityPolicy` is configured with: `defaultSrc 'self'`, `scriptSrc 'self' 'unsafe-inline' Clerk domains`, `imgSrc 'self' data: GCS`, `connectSrc 'self' Clerk`, `frameSrc 'none'`, `objectSrc 'none'`. `crossOriginEmbedderPolicy` is disabled to avoid breaking Clerk's hosted JS assets.

**Finding — PII in server logs (LOW) — FIXED ✅**
Two `[LERAP]` log lines in `farms.ts` that emitted raw email addresses have been patched:
- `[LERAP] Review notification sent to ${reviewer.email}` → `member #${reviewerId}`
- `[LERAP] Review notification sent to system user ${reviewerEmail}` → `external reviewer`
The `[PUSH]` line (`user ${member.linkedUserId}`) logs an opaque Clerk user ID, not an email — no change required.

**Finding — Audit log not append-only at DB level (LOW) — FIXED ✅**
`runLisMigrations()` (called on every server startup) now creates a `BEFORE UPDATE OR DELETE` trigger on `platform_audit_log` that raises an exception unconditionally. The trigger function (`platform_audit_log_immutable`) is defined with `CREATE OR REPLACE FUNCTION` and the trigger is recreated with `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`, making the migration idempotent. The table is now append-only at the Postgres layer regardless of connection role.

**Finding — Module bundle map not formally audited (LOW) — FIXED ✅**
`MODULE_BUNDLES` in `roleMiddleware.ts` has been annotated with: a structural explanation of the implied-grant pattern, an explicit security warning about the risk of overly broad trigger modules, the approval date (2026-07-12), and per-entry comments explaining the business rationale for each viticulture bundle (spray, risk/waste, training, equipment, stock). The map contents are unchanged — only the viticulture tier bundles remain.

**Finding — CSV import creates unvalidated write paths (LOW) — OPEN**
Bulk import endpoints (soil sensor CSV, and any future CSV importers) issue individual POST requests per row. If server-side Zod validation is absent on those endpoints, CSV-derived data bypasses UI constraints. A crafted CSV could write structurally invalid records at scale.

**Required guarantees:**
- All bulk import endpoints MUST apply the same Zod validation as their single-record counterparts.

**Finding — Admin SQL runner returns raw database error messages (LOW) — FIXED ✅**
The `/admin/sql` catch block now logs the full error server-side and returns a sanitised generic message to the admin client.

**Finding — Mobile offline sync — backdated timestamp injection (LOW) — FIXED ✅**
The API now ignores client-supplied `createdAt`/`updatedAt` on all synced records. `sanitiseBody()` strips these fields from every INSERT payload; the database uses its server-side `NOW()` default instead. Regulatory compliance records (spray applications, medicine treatments, livestock movements) cannot be backdated via a replayed sync queue.

**Finding — CSV formula injection in exports (LOW) — FIXED ✅**
All dashboard CSV export functions now use `sanitiseCsvCell()` / `quoteCsvCell()` / `downloadCsvFile()` from `artifacts/dashboard/src/lib/csv.ts`. Cells beginning with `=`, `+`, `-`, `@`, `|`, or `%` are prefixed with a tab character, preventing formula execution when the file is opened in Excel or Google Sheets.

---

## Summary: Prioritised Action List

| Priority | Finding | Status | Notes |
|---|---|---|---|
| 🔴 Critical | Mass assignment on INSERT/UPDATE routes | **FIXED ✅** | `sanitiseBody()` strips protected fields on all routes in `farms.ts` |
| 🟠 High | AI chat endpoint rate limit too generous | **FIXED ✅** | `publicLimiter` (20 req/IP/min) applied to `/api/support/chat` in `app.ts` |
| 🟠 High | CORS allows any origin | **FIXED ✅** | Explicit allowlist (`.replit.dev`, `.replit.app`, `ALLOWED_ORIGINS`) |
| 🟠 High | No rate limiting on any endpoint | **FIXED ✅** | `publicLimiter`, `authLimiter`, `uploadLimiter` all applied |
| 🟠 High | Object storage ACL disabled | **FIXED ✅** | 3-step auth check: attachment → farm → tenant membership |
| 🟡 Medium | Farm isolation — application layer only | **PARTIALLY FIXED ✅** | All 400+ routes patched with `validateFarmAccess`; RLS on 347 tables; policies still fail-open |
| 🟡 Medium | Admin SQL runner executes as superuser | **FIXED ✅** | `SET LOCAL ROLE app_readonly` inside read-only transaction; RLS now applies to runner queries |
| 🟡 Medium | **NEW** LIS LIP OAuth tokens unencrypted at rest | **FIXED ✅** | `encryptCredential`/`decryptLipToken` applied to all `platformAccessToken` + `lipRefreshToken` R/W sites in `farms.ts` |
| 🟡 Medium | Farmer credentials Base64 only | **FIXED ✅** | AES-256-GCM encryption at rest; `encryptCredential`/`decryptCredential` in `farms.ts` |
| 🟡 Medium | Admin portal — shared secret alongside Clerk | **PARTIALLY FIXED** | Clerk `isSuperAdmin` supported; shared-secret path still exists as bootstrap |
| 🟡 Medium | AI chat prompt injection / unbounded history | **FIXED ✅** | Capped at 20 messages × 2,000 chars server-side before forwarding to OpenAI |
| 🟡 Medium | Audit log coverage incomplete | **FIXED ✅** | `writeAuditLog()` confirmed on SQL runner, IMAP delete, config writes, email sends |
| 🟡 Medium | File size/MIME enforcement | **FIXED ✅** | 25 MB cap + MIME allowlist on presigned URL endpoint |
| 🔵 Low | RLS policies fail-open | **OPEN** | Flip to fail-closed once `farmRlsMiddleware` coverage confirmed 100% |
| 🔵 Low | Background jobs bypass RLS | **OPEN** | Alerting/job code uses bare pool; must call `set_app_tenant()` per farm in loops |
| 🔵 Low | No HTTP security headers | **FIXED ✅** | `helmet()` added to `app.ts`; CSP configured for Clerk + GCS; `crossOriginEmbedderPolicy` off |
| 🔵 Low | PII (email addresses) in server logs | **FIXED ✅** | `[LERAP]` log lines now use `member #${reviewerId}` / `external reviewer` |
| 🔵 Low | Audit log not append-only at DB level | **FIXED ✅** | `BEFORE UPDATE OR DELETE` trigger on `platform_audit_log` added to `runLisMigrations()` |
| 🔵 Low | Module bundle map unaudited | **FIXED ✅** | `MODULE_BUNDLES` annotated with rationale, security warning, and approval date 2026-07-12 |
| 🔵 Low | MIME type bytes not server-verified | **OPEN** | Client declares `contentType`; no magic-bytes check on actual upload |
| 🔵 Low | Attachment hard-delete (no tombstone) | **FIXED ✅** | Soft-delete with `deletedAt` flag; `isNull(deletedAt)` filter on all reads |
| 🔵 Low | Email address abuse via support ticket endpoint | **PARTIALLY FIXED ✅** | Per-recipient sliding-window rate limit (3/hr) added to `support.ts` |
| 🔵 Low | Mobile sync — backdated timestamp injection | **FIXED ✅** | `sanitiseBody()` strips `createdAt`/`updatedAt`; DB uses `NOW()` default |
| 🔵 Low | IMAP errors exposed to admin client | **FIXED ✅** | All IMAP catch blocks sanitised; full error logged server-side only |
| 🔵 Low | CSV formula injection in exports | **FIXED ✅** | All export helpers use `sanitiseCsvCell()`/`downloadCsvFile()` from `lib/csv.ts` |
| 🔵 Low | Admin SQL runner leaks DB error messages | **FIXED ✅** | Generic message returned to client; full error logged server-side |
| 🔵 Low | CSV import — unvalidated bulk write paths | **OPEN** | Bulk import endpoints should apply same Zod validation as single-record routes |
| 🔵 Low | **NEW** Dev bypass middleware — production safe | **CONFIRMED ✅** | `DEV_BYPASS_TOKEN` is `null` when `NODE_ENV !== "development"`; middleware is a no-op in production; confirm deployment sets `NODE_ENV=production` |
| 🔵 Low | **NEW** LIS LIP OAuth — CSRF/state protection | **ACCEPTABLE ✅** | HMAC-SHA256 signed state; server-side code exchange; hardcoded redirect URI; routes under `farmRlsMiddleware` |
