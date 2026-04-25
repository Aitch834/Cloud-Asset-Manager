# Threat Model — BDE Farm Trac

_Last reviewed: April 2026. Update whenever a new module, external integration, or auth change is introduced._

---

## Project Overview

BDE Farm Trac is a multi-tenant UK SaaS farm management platform built by Barnett Davies Enterprises Ltd. It helps farmers achieve Red Tractor scheme compliance by centralising records across crops, livestock, equipment, biosecurity, finance, and regulatory modules.

**Tech stack**

| Layer | Technology |
|---|---|
| API server | Node.js + Express 5 |
| Web dashboards | React + Vite (dashboard, admin portal, website) |
| Mobile | React Native / Expo |
| Database | PostgreSQL via Drizzle ORM |
| Authentication | Clerk (`@clerk/express`) |
| Object storage | Google Cloud Storage (via Replit object storage sidecar) |
| Payments | Stripe |
| SMS | Twilio |
| Email | Nodemailer outbound + ImapFlow (Titan) inbound |
| Gov integrations | BCMS / DEFRA CTS Web Services; LIS / England CLA API |

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
| **Personal data / PII** | Staff names, phone numbers, Right to Work documents, signatures. Regulated under UK GDPR. |
| **Clerk session tokens** | Valid tokens grant full dashboard access scoped to the user's tenant and role. |
| **Admin portal secret** | A single shared credential that grants unrestricted platform-wide access including SQL query execution and user impersonation. Highest-impact credential in the system. |
| **Third-party API credentials** | Twilio SID/token, Stripe secret key, Titan IMAP password — stored as environment secrets. Farmer-supplied BCMS (CTS) and LIS passwords — stored in the database. |
| **Uploaded attachments** | Photos and documents (defect evidence, vet certificates, insurance policies) stored in Google Cloud Storage. May contain sensitive commercial or personal information. |
| **Database connection string** | Direct database access; compromise gives full data exposure across all tenants. |
| **Stripe billing data** | Subscription status, invoice history. Compromise could allow unauthorized subscription manipulation. |

---

## Trust Boundaries

| Boundary | What it separates |
|---|---|
| **Browser / Mobile → API** | All client requests cross here. Clients are untrusted; the API must authenticate and authorise every request. |
| **Tenant boundary** | Enforced by `tenantMiddleware` — a user authenticated to tenant A must never access tenant B's data. This is the primary customer-isolation boundary. |
| **Farm boundary** | Within a tenant, each farm is isolated by `validateFarmAccess` in route handlers, confirmed against `farmsTable.tenantId`. This is application-layer isolation only. |
| **API → PostgreSQL** | Drizzle ORM with parameterised queries. The API process has direct unrestricted database access; no row-level security exists at the database layer. |
| **API → Google Cloud Storage** | The API proxies object access. ACL logic exists (`objectAcl.ts`) but is currently disabled on the download route. |
| **API → External Gov APIs** | Outbound calls to BCMS/DEFRA and LIS/CLA using farmer-supplied credentials. Hardcoded endpoint URLs (no SSRF risk). |
| **API → Twilio / Stripe / IMAP** | Outbound only. Stripe inbound webhooks are signature-verified. No other inbound webhooks identified. |
| **Public → Authenticated** | Four public API routes exist: `/api/healthz`, `/api/leads`, `/api/billing/webhook`, `/api/support/tickets`. All others require a valid Clerk session. |
| **Authenticated → Admin** | Admin portal routes (`/api/admin/*`) bypass Clerk entirely and use a shared `x-admin-secret` header checked against an environment variable. |

---

## Scan Anchors

**Production entry points**
- API server: `artifacts/api-server/src/app.ts` — middleware stack and route registration
- Primary route file: `artifacts/api-server/src/routes/farms.ts` — the bulk of all farm data endpoints
- Admin routes: `artifacts/api-server/src/routes/admin.ts` — highest-privilege surface
- Public routes: `artifacts/api-server/src/routes/leads.ts`, `billing.ts`, `storage.ts`

**Highest-risk code areas**
- `artifacts/api-server/src/routes/farms.ts` — mass-assignment pattern (`set(req.body)`) throughout
- `artifacts/api-server/src/routes/admin.ts` — SQL runner, impersonation, IMAP error exposure
- `artifacts/api-server/src/lib/objectStorage.ts` + `objectAcl.ts` — attachment access control
- `artifacts/api-server/src/middlewares/tenantMiddleware.ts` — tenant isolation gate
- `artifacts/api-server/src/middlewares/adminPortalMiddleware.ts` — admin authentication

**Auth surfaces**
- Protected: all routes under `/api/farms/*` require `requireAuth` + `requireTenant` + `validateFarmAccess`
- Public: `/api/healthz`, `/api/leads`, `/api/billing/webhook`, `/api/support/tickets`, `/api/help-images/*`
- Admin-only: `/api/admin/*` (secret header, not Clerk)

**Dev-only / ignore in production scans**
- `artifacts/mockup-sandbox/` — design preview server, not production
- `artifacts/test-dashboard/` — internal testing UI

---

## Threat Categories

### Spoofing

Clerk handles authentication for all standard user sessions. `clerkMiddleware()` validates the JWT on every request and `requireAuth` rejects requests without a valid `userId`. This boundary is solid.

**Finding — Admin portal uses a single shared secret (MEDIUM)**
The admin portal authenticates via a static `x-admin-secret` header rather than individual Clerk accounts. There is no per-person identity, no MFA, and no granular audit log of which human performed which admin action. If the secret rotates (or is leaked), there is no record of what was done under it.

**Required guarantees:**
- The `ADMIN_PORTAL_SECRET` must be rotated immediately if anyone with knowledge of it leaves the organisation.
- All admin actions in `admin.ts` MUST write a structured audit log entry (timestamp, action, affected tenant/user, IP address) before going to production with multiple admins.
- Consider migrating admin access to individual Clerk accounts with an `isBDEAdmin` metadata flag, eliminating the shared-secret model.

---

### Tampering

**Finding — Mass assignment on update routes (CRITICAL)**
Throughout `farms.ts`, update handlers use the pattern:

```typescript
db.update(someTable).set(req.body).where(eq(someTable.id, id))
```

This passes the entire raw request body directly to Drizzle's `.set()`. A malicious authenticated user can include fields not intended to be user-editable in their JSON payload — for example `tenantId`, `farmId`, `createdAt`, or internal status flags — and Drizzle will write them to the database if those columns exist in the table schema. This is a classic mass-assignment vulnerability.

A realistic attack: a valid authenticated user sends a PATCH body containing `"farmId": 99` to overwrite which farm a record belongs to, potentially orphaning data into another farm within the same tenant.

**Required guarantees:**
- Every `.set()` call MUST use an explicit allowlist of updateable fields, never the raw `req.body`. Example: `db.update(fieldsTable).set({ name: req.body.name, area: req.body.area, ... })`.
- A server-side Zod schema MUST be parsed before any database write. The parsed object (not `req.body`) is what gets written.
- Fields that must never be user-writable — `id`, `farmId`, `tenantId`, `createdAt` — must be stripped at the route layer or omitted from the allowlist entirely.

**Finding — No server-side input validation (HIGH)**
Zod schemas exist in `lib/api-zod` and are used by the generated API client for client-side type safety, but they are not parsed server-side before data reaches the database. A caller bypassing the web UI can send arbitrary field types, empty strings where values are required, or negative numbers where only positive values make sense. The OpenAPI spec describes the contract but does not enforce it.

**Required guarantees:**
- Every POST and PATCH handler MUST parse `req.body` through a Zod schema (`.parse()` or `.safeParse()`) before any database operation.
- Validation errors must return 400 with a structured message — never silently write partial data.

---

### Repudiation

The platform has extensive in-product audit trails (status workflows, assignment history, task timestamps). However there are gaps at the infrastructure level.

**Finding — Admin actions lack a durable audit log (MEDIUM)**
The admin portal can execute SQL queries, impersonate users, modify platform config, and read IMAP email. None of these actions appear to write to a persistent audit log table. The only record is Express server console output, which is ephemeral.

**Finding — No audit log for attachment deletion (LOW)**
Record attachments can be deleted. There is no tombstone or deletion audit trail; once removed, there is no record that a document was ever attached. For Red Tractor audit purposes this could be a concern if documents are deleted post-inspection.

**Required guarantees:**
- A `platform_audit_log` table MUST be written for every admin action: who (identity), what (action + payload summary), when (timestamp), affected entity (tenant/farm/user ID).
- Attachment deletions MUST be soft-deleted (status flag) rather than hard-deleted from the database record, even if the object is removed from storage.

---

### Information Disclosure

**Finding — Object storage access control disabled (HIGH)**
The private attachment download route (`GET /api/storage/objects/*`) serves files by path. The ACL function `canAccessObject` exists in `objectAcl.ts` but is commented out in the route handler. Currently, any authenticated user who knows (or guesses) a valid object path can download the file regardless of which farm or tenant it belongs to. Object paths are UUIDs, making guessing unlikely — but any path leaked via a log, error message, or API response would grant access.

**Required guarantees:**
- `canAccessObject` MUST be re-enabled on the download route before launch, verifying that the requesting user's tenant/farm has a `farm_record_attachments` row linking their session to the requested object path.
- Object paths MUST NOT appear in client-facing error messages or logs accessible to end users.

**Finding — Farmer third-party credentials stored without encryption (MEDIUM)**
BCMS (CTS) passwords and LIS passwords supplied by farmers are stored in the database in fields named `ctwsPasswordEncrypted` / similar, but the implementation in `farms.ts` shows they are Base64-encoded, not cryptographically encrypted. Base64 is trivially reversible. If the database were accessed by an attacker (or a developer), farmer government portal credentials would be immediately readable.

**Required guarantees:**
- These fields MUST be encrypted at rest using a server-side encryption key (AES-256 via Node `crypto`) before any production launch. The encryption key must live in an environment secret, not in source code.
- Decryption must only occur server-side, immediately before the credential is used for an outbound API call, and the plaintext must never be written to logs.

**Finding — CORS allows any origin with credentials (HIGH)**
The API server is configured with:
```typescript
app.use(cors({ credentials: true, origin: true }))
```
`origin: true` reflects whatever `Origin` header the browser sends. Combined with `credentials: true`, this means a malicious third-party website can make authenticated API requests on behalf of a logged-in BDE Farm Trac user if they can get that user to visit the malicious page (CSRF-style cross-origin attack).

**Required guarantees:**
- CORS `origin` MUST be set to an explicit allowlist: the dashboard domain, admin portal domain, and website domain. Example:
  ```typescript
  origin: ['https://bdefarmtrac.co.uk', 'https://app.bdefarmtrac.co.uk']
  ```
- In development, allow `localhost` variants only when `NODE_ENV !== 'production'`.

**Finding — IMAP error messages exposed to admin client (LOW)**
Several routes in `admin.ts` return raw exception messages from the IMAP library (`imapflow`) to the admin HTTP client. These messages can include connection strings, server names, and authentication error details that should remain server-side.

**Required guarantees:**
- IMAP (and other internal service) catch blocks in `admin.ts` MUST log the full error server-side but return only a sanitised message to the client (e.g., `"Unable to connect to mail server"`).

---

### Denial of Service

**Finding — No rate limiting on any endpoint (HIGH)**
`express-rate-limit` is listed as a dependency but is not applied anywhere in `app.ts` or any route file. This means:
- The public `/api/leads` endpoint can be flooded to generate spam entries.
- The `/api/support/tickets` endpoint can be flooded.
- Auth-adjacent endpoints (login redirects, session checks) have no throttle.
- Authenticated endpoints have no per-user or per-farm request cap, making targeted abuse possible.

**Required guarantees:**
- Rate limiting MUST be applied to all public unauthenticated endpoints (`/api/leads`, `/api/support/tickets`) — suggested limit: 10 requests per IP per minute.
- A general authenticated-user rate limit SHOULD be applied platform-wide — suggested: 300 requests per user per minute.
- File upload presigned-URL requests (`POST /api/storage/uploads/request-url`) MUST be rate-limited per user to prevent storage abuse.

**Finding — No server-side file size enforcement (MEDIUM)**
The presigned URL endpoint accepts a `size` value from the client but does not enforce a maximum before issuing the upload URL. A client could request a URL for a multi-gigabyte file. The upload goes directly to Google Cloud Storage, so the API server is not the bottleneck — but storage costs and potential abuse are real.

**Required guarantees:**
- The presigned URL endpoint MUST reject requests where `size` exceeds a defined maximum (suggested: 25 MB per file).
- File MIME type MUST be validated server-side against an allowlist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`) — not just trusted from the client.

---

### Elevation of Privilege

**Finding — Farm-level isolation is application-layer only (MEDIUM)**
Tenant isolation is hard-enforced at middleware level (robust). Farm isolation within a tenant relies on `validateFarmAccess` being called at the top of each route handler. This is consistently applied in the current codebase, but there is no database-level guard. A future developer adding a new route who omits the check would silently create a data bleed path between farms within the same tenant account.

**Required guarantees:**
- A code review checklist item MUST be established: every new route touching farm data must call `validateFarmAccess` and filter all subsequent queries by the returned `farmId`.
- Medium-term: implement PostgreSQL Row Level Security (RLS) on all resource tables so that the database itself enforces `farmId` scoping regardless of application code. This provides a defence-in-depth layer.

**Finding — CSV import creates unvalidated write paths (LOW)**
The soil sensor CSV bulk import (`FctImportDialog.tsx`) processes files client-side and issues individual POST requests per row. Because server-side validation is absent (see Tampering above), CSV-derived data bypasses any UI constraints. A crafted CSV could write structurally invalid records at scale.

**Required guarantees:**
- Bulk import endpoints MUST apply the same Zod validation as single-record endpoints.
- CSV cells MUST be sanitised before export to prevent formula injection when imported data is later re-exported and opened in Excel (`=`, `+`, `-`, `@` prefixes must be escaped).

**Finding — Admin SQL runner returns raw database error messages (LOW)**
The `/admin/sql` endpoint's catch block returns `err.message` directly to the admin client. While access is restricted to super admins, verbose database error messages can aid an attacker who has compromised an admin session.

**Required guarantees:**
- The SQL runner catch block should log the full error server-side and return a sanitised message to the client. The current admin-only restriction mitigates the impact but does not eliminate the risk.

---

## Summary: Prioritised Action List

| Priority | Finding | Action |
|---|---|---|
| 🔴 Critical | Mass assignment on update routes | Explicit field allowlists + server-side Zod validation on all POST/PATCH handlers |
| 🟠 High | CORS allows any origin with credentials | Restrict `origin` to explicit domain allowlist |
| 🟠 High | No rate limiting on any endpoint | Apply `express-rate-limit` to public routes and a general authenticated cap |
| 🟠 High | No server-side input validation | Zod `.parse()` before every database write |
| 🟠 High | Object storage ACL disabled | Re-enable `canAccessObject` check on download route |
| 🟡 Medium | Farmer credentials Base64 only | AES-256 encryption at rest with env-secret key |
| 🟡 Medium | Admin portal — shared secret, no audit log | Per-admin Clerk accounts + `platform_audit_log` table |
| 🟡 Medium | No server-side file size/type validation | Enforce 25 MB cap and MIME allowlist on presigned URL endpoint |
| 🟡 Medium | Farm isolation — application layer only | RLS on resource tables as defence-in-depth |
| 🔵 Low | Attachment hard-delete (no tombstone) | Soft-delete with audit trail |
| 🔵 Low | IMAP errors exposed to admin client | Sanitise catch blocks in `admin.ts` |
| 🔵 Low | CSV formula injection in exports | Escape formula-trigger characters in exported cells |
| 🔵 Low | Admin SQL runner leaks DB error messages | Sanitise catch block in `/admin/sql` |
