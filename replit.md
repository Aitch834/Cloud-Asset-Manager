# Workspace

## Overview
This project is a pnpm workspace monorepo for BDE Farm Trac, a multi-tenant farm management and compliance platform. It provides tools for field, crop, livestock, financial, and regulatory compliance (e.g., Red Tractor) for farmers. The platform includes a React web dashboard, an Expo React Native mobile app, a marketing website, and an Express API server. The goal is to streamline farm operations, ensure compliance, offer valuable insights, and capture a significant share of the agricultural technology market.

## User Preferences
I prefer clear and direct communication. When making changes, prioritize iterative development and explain the high-level approach before diving into code. Ask for confirmation before implementing significant architectural changes or adding new external dependencies. For code, I appreciate well-structured, maintainable TypeScript.

## System Architecture

### UI/UX Decisions
The platform uses React with Vite for the dashboard and marketing website, and Expo React Native for the mobile app. The dashboard features comprehensive sidebar navigation and consistent CRUD interfaces via `ModulePage`. The mobile app prioritizes an offline-first, native-like experience with GPS and Red Tractor compliance forms. Design tokens and a Tailwind preset are shared via `lib/shared-assets`. Error boundaries are implemented for graceful error handling.

### Technical Implementations
The monorepo uses `pnpm workspaces` with Node.js 24 and TypeScript 5.9.

**API Server (`artifacts/api-server`):**
- Built with Express 5, supporting a multi-tenant architecture.
- **Authentication: Clerk** (`@clerk/express`) — JWT verified via `clerkMiddleware`, `requireAuth` uses `getAuth(req)`, sets `req.userId`. Old Replit Auth (openid-client, cookieParser, authMiddleware) fully removed.
- `GET /api/billing/modules` returns `{ id, moduleKey, name, description, monthlyPricePence, isCore }` — `isCore` derived from key set (currently `red-tractor-compliance`).
- Manages tenant context, roles, and module-based permissions.
- Provides routes for various farm-specific modules, authentication, and administration.

**Database Layer (`lib/db`):**
- Utilizes PostgreSQL with Drizzle ORM, comprising over 70 tables.
- Covers authentication, core tenant data, leads, support, and all farm management modules (e.g., fields, crops, livestock, equipment, financial).
- Includes specific tables for various sales types, `farm_locations` for building/area registry, `workshop_goods_returns` for RTN tracking, `herd_health_events` for the Herd Health Register clinical event log, `sire_register` for bull/ram register (owned, hired-in, loaned sires with BVD/scrapie/fertility records), `feed_contingency_plans` for Red Tractor-required feed supply contingency plans, `feed_recall_incidents` for feed withdrawal/recall incident logging, and `disease_incident_log` for timestamped disease and health incident records with APHA reporting fields. The existing `biosecurity_plans` table was extended with emergency contacts (vet, APHA), footwear hygiene, new animal isolation, feed security, and disease suspicion procedure fields.
- **Farm Services module** (lib/db/src/schema/farm-services.ts): 9 tables — `farm_customers`, `service_agreements`, `third_party_grain_intakes`, `third_party_grain_movements`, `service_invoices`, `service_invoice_lines`, `equipment_hire_bookings`, `equipment_hire_condition_logs`, `equipment_hire_fuel_issues`. Tracks customers, storage/drying/land-rental/contracting agreements, traceability lot references for third-party grain, VAT invoicing, and equipment hire with full condition check and fuel tracking.
- **Equipment Hire module** (Farm Services → Equipment Hire tab): Full booking lifecycle (booked → active → returned → invoiced), pre-hire and return condition checks with hours meter/fuel level, per-booking fuel issue log with billing flag, insurance policy cross-reference warning on booking dates, revenue summary by machine and customer, printable hire agreement (with T&Cs + signature blocks), printable pre-hire and return handover checklists.
- **Vet Ledger module** (lib/db/src/schema/vet-ledger.ts): 4 tables — `vet_visits` (per-visit clinical record with diagnoses, treatments, prescriptions, follow-up tracking, time/cost), `vet_visit_medicines` (medicines administered or dispensed per visit with batch numbers, withdrawal periods, vet-dispensed flag), `vet_invoices` (invoice header with payment status and reconciliation status), `vet_invoice_lines` (line items typed by call_out/consultation/medicine/lab_test/scanning/tb_testing/procedure/other, linkable to visits). UI at `/vet-ledger` (under Livestock nav). Auto-computes reconciliation status: unreconciled / partial / reconciled based on matched lines.
- **Insurance schema extended**: `farm_insurance` table now has `annual_premium_pence`, `renewal_date`, `broker`, `broker_contact`, `covers_third_party_goods`, `covers_contract_work`, `covers_employer_liability`, `last_reviewed_date`.

**Dashboard (`artifacts/dashboard`):**
- React + Vite application using `wouter` for routing and TanStack React Query for data fetching.
- **Authentication: Clerk** (`@clerk/react`) — `ClerkProvider` always wraps the app; `VITE_DEV_BYPASS_AUTH=true` switches routing to `DevBypassContent` (no auth guards). `/sign-in` and `/sign-up` routes use Clerk's `<SignIn>`/`<SignUp>` components. `AuthGate` protects all app routes.
- **Onboarding wizard** (`/onboard`): 4-step flow — Business Details → Farm Details → Module Selection → Payment. `SelectContext` auto-redirects new users with 0 tenants to `/onboard`.
- Zustand manages and persists tenant/farm selection.
- Implements a fetch-patch interceptor for `x-tenant-slug` header.
- Features quick access cards, activity feed, and a compliance health panel.
- **Module gating**: Sidebar filters nav items based on `activeModuleKeys` from `GET /api/farms/:id/dashboard` subscriptions. Items with no matching subscription are hidden.

**Mobile App (`artifacts/mobile`):**
- Expo React Native app (SDK 54) with `expo-router` for routing.
- **Offline-first architecture:** Uses SQLite/AsyncStorage with a sync queue, connectivity detection, and exponential backoff retries.
- Features GPS-tagged records, visitor logging, Red Tractor compliance forms, and field boundary mapping.
- Includes a `ref_cache` SQLite layer for syncing reference data (herds, suppliers, batches).
- Employs a `LookupPicker` component for searchable selections in forms like Feed Record and COSHH Assessment.

**Marketing Website (`artifacts/website`):**
- React + Vite application with `wouter` for routing.
- Includes marketing pages, pricing, contact information, cookie consent, and GDPR-compliant privacy policies.

**Test Dashboard (`artifacts/test-dashboard`):**
- A login-free development and testing version of the dashboard, sharing the same React source.
- Uses environment variables for authentication bypass and mock admin access.
- Vite config restricts React plugin `include` to test-dashboard's own `src/` dir to avoid React Refresh transforms on cross-workspace `@fs/` files from dashboard.
- **Key lesson**: React 19 wraps ANY render-time error (JSON.parse, ReferenceError, etc.) as misleading "Invalid hook call" with `{}` error objects. Always add detailed error logging to ErrorBoundary when debugging such errors.

**Production Readiness:**
- API server performs an environment variable audit.
- React apps use error boundaries, loading skeletons, and error states with retry.
- Supports Xero-compatible CSV export and Red Tractor compliance export (CSV/JSON).
- Modules like Spray, NMP, NVZ, Documents, Soil Tests, Biosecurity, Medicine, Stock & Supplier Management have advanced features.
- **Spray Records** (`/sprays`): Full spray application log with 6 products (herbicides, fungicides, insecticide, foliar feed — real MAPP numbers), 15+ applications seeded for Oakfield farm. Product register, day-view, and printable assessor log tabs all wired.
- **Sales & Trading** (`/sales-trading`): Full grain sales (5 records — spot/forward/pool), livestock deadweight sales (3 kill sheets — ABP), mart sales (2 — Newark/Bakewell), crop contracts (2), milk, poultry, pigs, and direct-sales tabs all wired. GrainBinSelect response-format bug fixed (`Array.isArray(d)` check).
- **Trade History** (`/trade-history`): Analytics/reporting page — routed in App.tsx, sidebar link under Financial section, default export page wrapper added (`TradeHistoryPage` wrapping `TradeHistoryTab`).
- **Financial Records** (`/financial`): 12 financial transactions seeded (5 income, 7 expense), 2 crop contracts, 3 grants (SFI, CS Higher Tier, FETF) all inserted.
- **Startup seed (`seedDefaults.ts`)**: `seedSprayData`, `seedGrainSales`, `seedLivestockSales`, `seedFinancialData`, `seedGrainBins` all added — demo farm data automatically restored on server restart/DB reset.
- Soil Tests page has a "Sensors" tab (SoilSensorsTab) for continuous soil monitoring: register sensor probes (manufacturer, model, depths, GPS, field), add manual readings (moisture %, temperature °C, EC μS/cm), import from CSV (bulk up to 5,000 rows), and view readings as a time-series chart or table. DB tables: soil_sensor_probes, soil_sensor_readings. API: /api/farms/:farmId/soil-sensors and /readings sub-routes.
- Grain Storage, Workshop, and Health & Safety modules have been restructured and enhanced with specific functionalities, including document management and detailed inventory tracking.
- Crop Trials module supports the full trial lifecycle, including plot design with GPS, treatment logging, yield comparisons, and a Leaflet-based Map View.
- An admin panel supports full support ticket workflow and a dedicated BDE Admin Portal (`/admin-portal`) provides extensive management features for customers, leads, referrals, invoices, and support, with its own API routes and database schema additions for referral tracking and churn management.
- **Non-Crop Land Use / Season Status**: New `field_season_land_use` table (`fieldSeasonLandUseTable`) added to `lib/db/src/schema/fields-crops.ts` with columns: farmId, fieldId, year, season, landUse (enum: fallow, temporary_ley, permanent_grassland, sfi, countryside_stewardship, cover_crop_unharvested, woodland_agroforestry, other), schemeActionCode, schemeReference, areaHectares, startDate, endDate, managementNotes. Full CRUD API at `/api/farms/:farmId/field-season-land-use`. Dashboard UI in Fields.tsx: land use badge on field cards, "Record land use" prompt when no crop assigned, LandUseDialog for create/edit (scheme action code + reference fields shown only for SFI / CS types), field drawer shows land use panel in Overview tab and merged crop+land use Season History timeline, Crops Register tab shows a Non-Crop Land Use section below crop groups. PrintCropRegister upgraded to "Field Use Register" print report covering both crop and land use rows. Help Centre and Features pages updated with full Q&A and feature bullet documentation.
- **Land Tenure**: `fieldsTable` extended with land tenure columns (`tenure_type`, `landlord_supplier_id` FK → `suppliers.id`, `tenancy_start_date`, `tenancy_end_date`, `annual_rent_pounds`, `rent_review_date`, `tenure_notes`). Landlord is now stored as a FK to `suppliersTable` (type "landlord") rather than free-text fields. A "Land Tenure" tab is added to the field detail drawer in Fields.tsx, showing tenure type (owned/FBT/AHA/contract farming/grazing licence/other), landlord details from the linked supplier record, tenancy dates, annual rent, and rent review date. Edit form has a supplier dropdown + "New landlord" quick-add dialog. Contextual expiry warnings (red ≤90 days, amber ≤180 days) and rent review alerts (blue ≤90 days). Field tenure document attachments via `field_tenure_documents` table with object storage. Dedicated `/api/farms/:farmId/landlords` (GET/POST) endpoints scoped to `field-crop-management` module.

### Multi-Tenant Architecture
- Each client is a tenant managing multiple farms.
- Users are authenticated via Replit Auth and linked to tenants.
- System roles (BDE Super Admin, Client Admin, Farm Manager, Farm Staff) define module-based permissions.
- Subscriptions are managed per-farm and per-module, integrated with Stripe.
- API requests are tenant-scoped using the `x-tenant-slug` header.

### System Roles
1. BDE Super Admin: Full internal platform access.
2. Client Admin: Full tenant management access.
3. Farm Manager: Full access to assigned farms.
4. Farm Staff: Limited module-based access.

### Modules
The platform supports 17 core compliance modules with monthly pricing, covering areas like Field & Crop Management, Sprays & Inputs, Soil Management, Livestock Management, Biosecurity, and Financial Records. A dedicated Dairy Management module provides detailed tracking for milk, mastitis, calving, and other dairy-specific metrics.

## External Dependencies

- **Monorepo Tool:** pnpm workspaces
- **Package Manager:** pnpm
- **API Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod, `drizzle-zod`
- **API Codegen:** Orval
- **Build Tool:** esbuild
- **Payments:** Stripe
- **Authentication:** Clerk (`@clerk/express` server, `@clerk/react` client; JWT-verified via `clerkMiddleware`; dev bypass via `VITE_DEV_BYPASS_AUTH=true`)
- **Email:** Brevo SMTP (`smtp-relay.brevo.com`, via `nodemailer`; functions in `lib/mailer.ts`; requires `SMTP_PASS` secret)
- **Email Inbox:** Titan IMAP (`imap.secureserver.net`, `hello@bdefarmtrac.co.uk`; requires `TITAN_IMAP_PASSWORD` secret)
- **AI Integration:** OpenAI (gpt-5-mini)
- **SMS Notifications:** Twilio (3 env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`)
- **Mobile Development:** Expo SDK 54, expo-router, expo-auth-session, expo-location, expo-image-picker, expo-haptics, expo-crypto
- **Mobile Storage:** SQLite, AsyncStorage, SecureStore
- **Mapping:** react-native-maps
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Routing:** wouter, expo-router