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

### Admin (requires BDE Super Admin)
- `GET /api/admin/tenants` — List all tenants
- `GET /api/admin/tenants/:tenantId` — Tenant detail with farms/subs/users
- `GET /api/admin/stats` — Platform statistics
- `POST /api/admin/impersonate` — Impersonate user
