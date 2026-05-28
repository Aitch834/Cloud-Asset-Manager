# Threat Model — BDE Farm Trac

_Last reviewed: May 2026. Update whenever a new module, external integration, or auth change is introduced._

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
| **Personal data / PII** | Staff names, phone numbers, Right to Work documents, signatures, TB test records. Regulated under UK GDPR. |
| **Clerk session tokens** | Valid tokens grant full dashboard access scoped to the user's tenant and role. |
| **Admin portal secret** | A single shared credential (plus per-user Clerk `isSuperAdmin` flag) granting platform-wide access including SQL execution. Highest-impact credential in the system. |
| **Third-party API credentials** | Twilio SID/token, Stripe secret key, Titan IMAP password, OpenAI API key — stored as environment secrets. Farmer-supplied BCMS (CTS) and LIS passwords — stored in the database. |
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
| **Farm boundary** | Within a tenant, each farm is isolated by `validateFarmAccess` in route handlers, confirmed against `farmsTable.tenantId`. This is application-layer isolation only — no database-level guard exists. |
| **API → PostgreSQL** | Drizzle ORM with parameterised queries. The API process has direct unrestricted database access; no row-level security exists at the database layer. |
| **API → Google Cloud Storage** | Private object downloads (`GET /storage/objects/*`) are access-controlled: attachment must exist in `farm_record_attachments`, farm must belong to user's tenant. Public assets (`/storage/public-objects/*`) are unconditionally public — ensure no private content reaches the public path. |
| **API → OpenAI** | Outbound only. User-supplied conversation history is passed to OpenAI's API. Content is not sanitised before forwarding. |
| **API → External Gov APIs** | Outbound calls to BCMS/DEFRA and LIS/CLA using farmer-supplied credentials. Hardcoded endpoint URLs (no SSRF risk). |
| **API → Twilio / Stripe / IMAP** | Outbound only. Stripe inbound webhooks are signature-verified. No other inbound webhooks identified. |
| **Public → Authenticated** | Public API routes: `/api/healthz`, `/api/leads`, `/api/billing/webhook`, `/api/support/tickets`, `/api/support/chat`, `/api/help-images/*`. All others require a valid Clerk session. |
| **Authenticated → Admin** | Admin portal routes (`/api/admin/*`) accept either a valid `x-admin-secret` header OR a Clerk-authenticated session with `isSuperAdmin = true` in `userTenantsTable`. |
| **Mobile → API (offline sync)** | The mobile app queues records in SQLite when offline and submits them on reconnect. Records enter the API with the user's Clerk token but without real-time server validation at the point of creation. |

---

## Scan Anchors

**Production entry points**
- API middleware stack: `artifacts/api-server/src/app.ts`
- Primary farm data routes: `artifacts/api-server/src/routes/farms.ts`
- Admin routes (highest privilege): `artifacts/api-server/src/routes/admin.ts`
- Public routes: `artifacts/api-server/src/routes/support.ts`, `leads.ts`, `billing.ts`, `storage.ts`
- Mobile-specific routes: `artifacts/api-server/src/routes/mobile.ts`

**Highest-risk code areas**
- `artifacts/api-server/src/routes/farms.ts` — mass-assignment pattern (`set(req.body)`) throughout
- `artifacts/api-server/src/routes/admin.ts` — SQL runner, IMAP access, audit log writer
- `artifacts/api-server/src/routes/support.ts` — public AI chat (prompt injection) + email-sending ticket endpoint
- `artifacts/api-server/src/lib/objectStorage.ts` — attachment access control
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

**Finding — Admin portal shared secret still present alongside Clerk (MEDIUM)**
The admin portal now supports individual Clerk accounts with `isSuperAdmin = true`, which is an improvement over the April model. However, the shared `ADMIN_PORTAL_SECRET` header path still exists alongside it in `adminPortalMiddleware`. Both auth methods remain active. The shared-secret path provides no per-person identity or audit trail.

**Required guarantees:**
- The `ADMIN_PORTAL_SECRET` path should be treated as a bootstrap mechanism only. The target state is all admin access going through individual Clerk accounts with `isSuperAdmin`, with the shared-secret path disabled or IP-restricted at the network level.
- `ADMIN_PORTAL_SECRET` must be rotated immediately if any person with knowledge of it leaves the organisation.
- The audit log (`writeAuditLog`) must be called for all sensitive admin actions — verify coverage is complete, particularly on IMAP and SQL runner routes.

---

### Tampering

**Finding — Mass assignment on update routes (CRITICAL) — NOT YET FIXED**
Throughout `farms.ts`, many update handlers still use:

```typescript
db.update(someTable).set(req.body).where(eq(someTable.id, id))
```

This passes the raw request body directly to Drizzle's `.set()`. A malicious authenticated user can include fields not intended to be user-editable (`tenantId`, `farmId`, `createdAt`, internal status flags) and Drizzle will write them to the database. This is the highest-priority unfixed finding from the April model.

**Required guarantees:**
- Every `.set()` call MUST use an explicit allowlist of updateable fields, never raw `req.body`.
- A server-side Zod schema MUST be parsed before any database write; the parsed object (not `req.body`) is what gets written.
- Fields that must never be user-writable — `id`, `farmId`, `tenantId`, `createdAt` — must be omitted from every allowlist.

**Finding — AI chat accepts unbounded user-supplied conversation history (LOW)**
The `/support/chat` endpoint accepts a `conversationHistory` array from the client and passes it directly to OpenAI as the message thread. A user can craft arbitrarily long conversation histories (inflating OpenAI API costs) or inject instructions designed to manipulate the assistant's behaviour (prompt injection).

**Required guarantees:**
- `conversationHistory` MUST be capped server-side at a maximum length (suggested: 20 messages) and each message `content` field MUST be truncated (suggested: 2,000 characters) before forwarding to OpenAI.
- The system prompt MUST NOT contain credentials, internal configuration, or any information that would be harmful if extracted by a prompt injection attack. (Currently clean — maintain this.)

---

### Repudiation

**Significant improvement since April: `platform_audit_log` table and `writeAuditLog()` helper now exist in `admin.ts`.**

**Finding — Audit log coverage needs verification (MEDIUM)**
`writeAuditLog()` exists and is called in several admin routes, but full coverage across all sensitive admin actions has not been verified. IMAP operations (read, delete, mark-read) and the SQL runner catch block should be audited.

**Finding — No audit log for attachment deletion (LOW) — NOT YET FIXED**
Record attachments can be deleted. There is no tombstone or deletion audit trail; once removed, there is no record that a document was ever attached. For Red Tractor audit purposes this could be a concern if documents are deleted post-inspection.

**Required guarantees:**
- Audit log calls must be confirmed present on: SQL runner executions, IMAP message deletion, tenant creation/deactivation, subscription changes, platform config writes, and admin email sends.
- Attachment deletions MUST be soft-deleted (status flag) rather than hard-deleted from the database record, even if the object is removed from storage.

---

### Information Disclosure

**Significant improvement since April: Object storage ACL is now fully enforced.** The private download route (`GET /storage/objects/*`) performs a three-step check: (1) path exists in `farm_record_attachments`, (2) farm belongs to a tenant, (3) requesting user is a member of that tenant. The April HIGH finding is resolved.

**Significant improvement since April: File size and MIME type enforcement is now server-side.** The presigned URL endpoint enforces a 25 MB cap and an explicit MIME type allowlist. The April MEDIUM finding is resolved.

**Finding — Farmer third-party credentials stored without encryption (MEDIUM) — NOT YET FIXED**
BCMS (CTS) passwords and LIS passwords supplied by farmers remain Base64-encoded in the database, not cryptographically encrypted. Base64 is trivially reversible. Any database read access (developer, backup leak, SQL injection) exposes farmer government portal credentials in plain text.

**Required guarantees:**
- These fields MUST be encrypted at rest using AES-256 (Node.js `crypto`) with a key stored as an environment secret before any production launch.
- Decryption must only occur server-side immediately before the outbound API call, and the plaintext must never be written to logs.

**Finding — User email addresses are accepted without verification on public ticket endpoint (LOW)**
The `/api/support/tickets` endpoint sends a confirmation email to whatever address is submitted in the request body. An attacker could submit another person's email address, causing unsolicited emails to be sent from BDE's mail domain — a potential reputation/spam classification risk.

**Required guarantees:**
- While authenticated users' addresses are prefilled from Clerk (trustworthy), unauthenticated/manually-logged tickets should validate that the submitted email address is plausible.
- Consider rate-limiting the outbound email per unique recipient address (not just per IP) to prevent a single IP from flooding a target inbox via multiple support ticket submissions.

**Finding — IMAP error messages exposed to admin client (LOW) — partially mitigated**
Some `admin.ts` catch blocks may still return raw IMAP library error messages. Admin-only scope reduces impact, but sanitised messages are still best practice.

**Required guarantees:**
- All catch blocks in `admin.ts` MUST log the full error server-side and return only a sanitised human-readable message to the client.

---

### Denial of Service

**Significant improvement since April: Rate limiting is now implemented.**
- Public endpoints (`/api/leads`, `/api/support/tickets`): 20 requests/IP/minute
- Presigned URL endpoint (`/api/storage/uploads`): 30 requests/user or IP/minute
- All other API routes: 300 requests/user or IP/minute

**Finding — AI chat endpoint rate limit too generous (MEDIUM)**
`/api/support/chat` is a public unauthenticated endpoint that proxies to OpenAI's API (incurring per-token cost). It is currently only covered by the general `authLimiter` (300 req/min per IP) — far too permissive for a cost-incurring public endpoint. A single IP can fire 300 OpenAI requests per minute, which could generate significant API cost.

**Required guarantees:**
- `/api/support/chat` MUST have its own dedicated rate limiter applied in `app.ts`, matching the public endpoint limit (suggested: 20 req/IP/minute).
- Consider also capping the total token budget per conversation server-side (the current `max_completion_tokens: 512` cap on responses is good — maintain it).

---

### Elevation of Privilege

**Finding — Farm-level isolation is application-layer only (MEDIUM) — NOT YET FIXED**
Tenant isolation is hard-enforced at middleware level (robust). Farm isolation within a tenant relies on `validateFarmAccess` being called at the top of each route handler. There is no database-level guard. A future developer adding a new route who omits the call silently creates a data bleed path between farms in the same tenant.

**Required guarantees:**
- Every new route touching farm data MUST call `validateFarmAccess` and filter all subsequent queries by the returned `farmId`.
- Medium-term: implement PostgreSQL Row Level Security (RLS) on all resource tables to enforce `farmId` scoping at the database layer regardless of application code.

**Finding — CSV import creates unvalidated write paths (LOW) — NOT YET FIXED**
Bulk import endpoints (soil sensor CSV, and any future CSV importers) issue individual POST requests per row. If server-side Zod validation is absent on those endpoints, CSV-derived data bypasses UI constraints. A crafted CSV could write structurally invalid records at scale.

**Required guarantees:**
- All bulk import endpoints MUST apply the same Zod validation as their single-record counterparts.
- CSV cells exported from the platform MUST sanitise formula-trigger characters (`=`, `+`, `-`, `@` as first character) to prevent formula injection when files are opened in Excel.

**Finding — Admin SQL runner returns raw database error messages (LOW)**
The `/admin/sql` endpoint's catch block returns `err.message` directly to the admin client. Admin-only scope reduces impact, but this should still be sanitised.

**Required guarantees:**
- The SQL runner catch block should log the full error server-side and return a sanitised message. The admin-only restriction mitigates but does not eliminate the risk.

**Finding — Mobile offline sync queue integrity (LOW)**
The mobile app queues records locally in SQLite when offline and submits them when connectivity is restored. Records submitted from the queue are processed through the standard API with the user's Clerk token. However, there is no server-side timestamp validation — a replayed or backdated sync queue entry could write a record with a manipulated timestamp.

**Required guarantees:**
- The API MUST ignore or overwrite any client-supplied `createdAt`/`updatedAt` timestamps on synced records, using server-side `NOW()` instead. This prevents falsified timestamps on regulatory compliance records (spray applications, medicine treatments, livestock movements).

---

## Summary: Prioritised Action List

| Priority | Finding | Status | Action |
|---|---|---|---|
| 🔴 Critical | Mass assignment on update routes | **OPEN** | Explicit field allowlists + server-side Zod on all POST/PATCH handlers in `farms.ts` |
| 🟠 High | AI chat endpoint rate limit too generous | **FIXED ✅** | `publicLimiter` (20 req/IP/min) now applied to `/api/support/chat` in `app.ts` |
| 🟠 High | CORS allows any origin | **FIXED ✅** | Now uses explicit allowlist (`.replit.dev`, `.replit.app`, `ALLOWED_ORIGINS`) |
| 🟠 High | No rate limiting on any endpoint | **FIXED ✅** | publicLimiter, authLimiter, uploadLimiter all applied |
| 🟠 High | Object storage ACL disabled | **FIXED ✅** | 3-step auth check: attachment → farm → tenant membership |
| 🟡 Medium | Farmer credentials Base64 only | **OPEN** | AES-256 encryption at rest with env-secret key |
| 🟡 Medium | Admin portal — shared secret alongside Clerk | **PARTIALLY FIXED** | Clerk `isSuperAdmin` now supported; shared-secret path still exists |
| 🟡 Medium | AI chat prompt injection / unbounded history | **NEW** | Cap `conversationHistory` length + per-message character limit server-side |
| 🟡 Medium | Audit log coverage incomplete | **OPEN** | Verify `writeAuditLog()` called on IMAP delete, SQL runner, config writes |
| 🟡 Medium | File size/MIME enforcement | **FIXED ✅** | 25 MB cap + MIME allowlist on presigned URL endpoint |
| 🟡 Medium | Farm isolation — application layer only | **OPEN** | RLS on resource tables as defence-in-depth |
| 🔵 Low | Attachment hard-delete (no tombstone) | **OPEN** | Soft-delete with audit trail |
| 🔵 Low | Email address abuse via support ticket endpoint | **NEW** | Per-recipient rate limiting on outbound confirmation emails |
| 🔵 Low | Mobile sync — backdated timestamp injection | **NEW** | Strip/overwrite client-supplied timestamps server-side on all sync writes |
| 🔵 Low | IMAP errors exposed to admin client | **OPEN** | Sanitise catch blocks in `admin.ts` |
| 🔵 Low | CSV formula injection in exports | **OPEN** | Escape formula-trigger characters in exported cells |
| 🔵 Low | Admin SQL runner leaks DB error messages | **OPEN** | Sanitise catch block in `/admin/sql` |
