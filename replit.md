# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Payments**: Stripe (subscription billing, module-based per farm)
- **Auth**: Replit Auth (OpenID Connect with PKCE)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   ├── dashboard/          # Farm management dashboard (React + Vite)
│   ├── mobile/             # Expo React Native mobile app (iOS/Android)
│   └── website/            # Marketing website (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── replit-auth-web/    # React auth hook (useAuth)
│   ├── integrations-openai-ai-server/ # OpenAI integration
│   └── shared-assets/      # BDE Farm Trac brand: logos, design tokens, Tailwind preset
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build`
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Express 5 Rules

- Route handlers: `async (req, res): Promise<void>`
- Wildcard routes: `/*splat` (not `/*`)
- No `return res.json()` — use `res.json(); return;`
- Route params: `req.params.x as string` (Express 5 params are `string | string[]`)

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with multi-tenant architecture.

- Entry: `src/index.ts` — reads `PORT`, starts Express, seeds default roles/modules
- App: `src/app.ts` — CORS, cookieParser, JSON, authMiddleware, tenantMiddleware, routes at `/api`
- Middlewares:
  - `authMiddleware.ts` — Replit Auth session resolution, OIDC token refresh
  - `tenantMiddleware.ts` — Resolves tenant from `x-tenant-slug` header, validates user membership
  - `roleMiddleware.ts` — `requireAuth`, `requireTenant`, `requireSuperAdmin`, `requireModulePermission`
- Routes:
  - `health.ts` — `GET /api/healthz`
  - `auth.ts` — `/api/login`, `/api/callback`, `/api/logout`, `/api/auth/user`, mobile auth
  - `leads.ts` — `POST /api/leads`
  - `support.ts` — `POST /api/support/chat`, `POST /api/support/tickets`
  - `tenants.ts` — Tenant CRUD, farm CRUD, invitations, staff assignments
  - `roles.ts` — Role CRUD, module listing, permission management
  - `billing.ts` — Stripe checkout, subscriptions, webhook handler
  - `admin.ts` — BDE Super Admin: tenant listing, stats, impersonation
- Seed: `src/lib/seedDefaults.ts` — Seeds 4 system roles and 16 modules on startup

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. 60+ tables across schema files:

Schema files:
- `auth.ts` — sessions, users (Replit Auth mandatory)
- `core.ts` — tenants, farms, roles, modules, permissions, user_tenants, staff_farm_assignments, subscriptions, user_invitations
- `leads.ts` — registration_leads
- `support-tickets.ts` — support_tickets
- `support-enhanced.ts` — support_ticket_messages
- `fields-crops.ts` — fields, field_boundaries, crops, field_crop_assignments, harvest_records, crop_transport_records, crop_storage_records, crop_destinations, crop_financial_transactions
- `sprays-inputs.ts` — spray_products, spray_applications, nutrient_management_plans, nmp_field_entries
- `soil.ts` — soil_test_records, soil_test_results
- `equipment.ts` — equipment, equipment_maintenance_logs, equipment_calibration_records, equipment_offboarding_records
- `livestock.ts` — herd_flock_register, livestock_animals, livestock_movements, livestock_medicine_records, livestock_feed_records, livestock_water_records
- `biosecurity.ts` — visitor_contractor_log, pest_control_records, cleaning_disinfection_records
- `staff-training.ts` — staff_training_records, staff_certificates
- `risk-waste.ts` — risk_assessments, coshh_records, waste_disposal_records
- `inspections.ts` — inspection_records, nonconformance_records, corrective_actions
- `environmental.ts` — environmental_features, agri_environment_scheme_records
- `haulage.ts` — haulage_records
- `stock-suppliers.ts` — suppliers, stock_items, stock_deliveries, stock_levels
- `financial.ts` — financial_transactions, financial_exports
- `documents.ts` — document_records, object_storage_refs
- `weather.ts` — weather_stations, weather_readings

DB commands:
- `pnpm --filter @workspace/db run push` — Push schema to DB
- `pnpm --filter @workspace/db run push-force` — Force push

### `artifacts/dashboard` (`@workspace/dashboard`)

Farm management dashboard. React + Vite + wouter + TanStack React Query. Preview path: `/dashboard`.

Pages: Login, SelectContext (tenant/farm picker), Dashboard (overview), Fields, Equipment, Sprays, Soil, Inspections, Risks, Waste, Visitors, Pest Control, Cleaning, Livestock, Movements, Medicine, Training, Stock, Financial, Environmental, Haulage, Documents, Weather, Help, Settings.

Key features:
- ModulePage generic component for all CRUD module pages (search, create, table view)
- Sidebar with full navigation across all 17+ compliance modules
- Fetch-patch interceptor auto-attaches x-tenant-slug header from localStorage
- Zustand store for tenant/farm selection (persisted to localStorage)
- Login redirects to `/api/login` (Replit Auth OIDC flow)
- AppLayout wrapper with sidebar + top header

### `artifacts/mobile` (`@workspace/mobile`)

Expo React Native mobile app for iOS & Android field use. Preview path: `/mobile/`.

Tech: Expo SDK 54, expo-router (file-based routing), NativeTabs (liquid glass iOS 26+), AsyncStorage, expo-location, expo-image-picker, expo-haptics, expo-crypto.

Tabs: Home (dashboard/compliance/weather/quick actions), Record (spray/weather/visitor/crop/soil/photo entry), Fields (GPS boundary mapping), Forms (Red Tractor compliance forms with templates), More (settings/sync/profile).

Features:
- Offline-first data storage: SQLite (native) with AsyncStorage fallback (web), sync queue with ordered processing
- GPS-tagged spray records, crop events, soil samples
- Visitor quick-log with biosecurity compliance toggle
- Red Tractor compliance form templates (17 types including medicine-administered, livestock-movement, water-test, cleaning-disinfection, pest-control)
- Field boundary recording via GPS waypoints with react-native-maps (native) / text fallback (web)
- Photo capture with geotagging via expo-image-picker
- Farm switching (multi-farm support)
- Demo data seeded on first launch (Manor Farm, Hill Top Farm)
- Sync engine with NetInfo connectivity detection, exponential backoff retries, auto-sync on reconnect
- Auth: Replit OIDC via expo-auth-session (PKCE flow) + SecureStore token storage (native) / localStorage (web); Demo Access mode in dev builds only

Architecture:
- Platform-split files: `FieldMap.tsx` (native with react-native-maps) / `FieldMap.web.tsx` (web fallback)
- `lib/database.ts`: Platform-aware — uses expo-sqlite on native, AsyncStorage on web
- `lib/auth.tsx`: AuthProvider with expo-auth-session OIDC, platform-aware token storage (SecureStore native / localStorage web)
- `lib/sync-engine.ts`: Dynamic requires for NetInfo (native only), reads auth token from SecureStore/localStorage, tenant slug included in sync requests
- `lib/storage.ts`: Unified API over database.ts (getItem, setItem, getList, appendToList, etc.)
- Context providers: FarmContext (farm/user state), SyncContext (offline sync queue)
- Storage keys prefixed with `bde_` in AsyncStorage/SQLite

### `artifacts/website` (`@workspace/website`)

Marketing website for BDE Farm Trac. React + Vite + wouter. Preview path: `/`.

Pages: Home, Features, Pricing, About, Contact, Privacy, Cookies, Login, Admin

### Multi-Tenant Architecture

- **Tenants**: Each client organization (e.g. a farm business) is a tenant
- **Farms**: Each tenant can have multiple farms with sector flags (arable, beef, dairy, pigs, poultry, horticulture)
- **Users**: Authenticated via Replit Auth, linked to tenants via `user_tenants` table
- **Roles**: BDE Super Admin, Client Admin, Farm Manager, Farm Staff (system roles seeded on startup)
- **Permissions**: Per-role, per-module (read/write/delete/approve)
- **Staff assignments**: Users can be assigned to multiple farms within a tenant
- **Modules**: 16 compliance modules, each with monthly pricing in pence
- **Subscriptions**: Per-farm, per-module, linked to Stripe
- **Tenant context**: API requests include `x-tenant-slug` header to scope to a tenant

### System Roles

1. BDE Super Admin — Full platform access (BDE staff only)
2. Client Admin — Full access to tenant management
3. Farm Manager — Full access to assigned farms
4. Farm Staff — Limited access based on module permissions

### Modules (16)

Red Tractor Compliance, Field & Crop Management, Sprays & Inputs, Soil Management, Equipment & Vehicle Management, Livestock Management, Biosecurity & Visitors, Staff & Training, Risk & Waste Management, Inspections & Audits, Environmental Features, Transport & Haulage, Stock & Supplier Tracking, Financial Records, Document Management, Weather Tracking

## API Endpoints

### Public
- `GET /api/healthz` — Health check
- `POST /api/leads` — Create registration lead
- `POST /api/support/chat` — AI chat (OpenAI gpt-5-mini)
- `POST /api/support/tickets` — Create support ticket

### Auth
- `GET /api/login` — Initiate Replit Auth OIDC flow
- `GET /api/callback` — OIDC callback
- `GET /api/logout` — End session
- `GET /api/auth/user` — Get current user

### Tenant Management (requires auth + x-tenant-slug)
- `GET /api/tenants/mine` — List user's tenants
- `POST /api/tenants` — Create new tenant
- `GET|PUT /api/tenants/current` — Get/update current tenant
- `GET|POST /api/tenants/current/farms` — List/create farms
- `PUT /api/tenants/current/farms/:farmId` — Update farm
- `GET|POST /api/tenants/current/invitations` — List/create invitations
- `GET|POST /api/tenants/current/staff-assignments` — List/create assignments

### Roles & Permissions (requires auth)
- `GET|POST /api/roles` — List/create roles
- `GET /api/modules` — List modules
- `GET /api/roles/:roleId/permissions` — Get role permissions
- `PUT /api/roles/:roleId/permissions/:moduleId` — Update permission

### Billing (requires auth + x-tenant-slug)
- `POST /api/billing/checkout` — Create Stripe checkout session
- `GET /api/billing/subscriptions` — List subscriptions
- `POST /api/billing/webhook` — Stripe webhook handler

### Farm Modules (requires auth + x-tenant-slug, under `/api/farms/:farmId/...`)
All farm module endpoints follow a consistent CRUD pattern with `RecordEnvelope` (single) and `RecordListResponse` (list) response shapes.

Modules: fields, crops, harvest-records, crop-transport, crop-storage, crop-destinations, crop-financial, spray-products, spray-applications, nmp, nmp-entries, soil-tests, soil-results, equipment, maintenance, calibration, offboarding, herds, animals, movements, medicine-records, feed-records, water-records, visitors, pest-control, cleaning, training, certificates, risk-assessments, coshh, waste, inspections, nonconformances, corrective-actions, environmental-features, agri-schemes, haulage, suppliers, stock-items, stock-deliveries, financial-transactions, financial-exports, documents, weather-stations, weather-readings

### Admin (requires BDE Super Admin)
- `GET /api/admin/tenants` — List all tenants
- `GET /api/admin/tenants/:tenantId` — Tenant detail with farms/subs/users
- `GET /api/admin/stats` — Platform statistics
- `POST /api/admin/impersonate` — Impersonate user
- `GET /api/admin/support-tickets` — List all support tickets
- `GET /api/admin/support-tickets/:ticketId` — Ticket detail with messages
- `POST /api/admin/support-tickets/:ticketId/reply` — Admin reply to ticket
- `PATCH /api/admin/support-tickets/:ticketId/status` — Update ticket status

### Exports & Compliance
- `POST /api/farms/:farmId/financial-exports` — Xero-compatible CSV export (Date, Amount, AccountCode, Description, Reference, TaxType, TaxAmount)
- `GET /api/farms/:farmId/compliance-export` — Red Tractor compliance data export (JSON or CSV via `?format=csv`)

### Platform Polish
- React ErrorBoundary wraps both dashboard and website apps (catches render crashes, shows "Something went wrong" with refresh button)
- Privacy and Cookie policy pages exist at `/privacy` and `/cookies`
- 404 pages exist for both dashboard and website
