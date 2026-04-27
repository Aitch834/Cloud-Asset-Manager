# Workspace

## Overview
This project is a pnpm workspace monorepo for BDE Farm Trac, a multi-tenant farm management and compliance platform. It offers tools for field, crop, livestock, financial, and regulatory compliance (e.g., Red Tractor) for farmers. The platform includes a React web dashboard, an Expo React Native mobile app, a marketing website, and an Express API server. The goal is to streamline farm operations, ensure compliance, offer valuable insights, and capture a significant share of the agricultural technology market.

## User Preferences
I prefer clear and direct communication. When making changes, prioritize iterative development and explain the high-level approach before diving into code. Ask for confirmation before implementing significant architectural changes or adding new external dependencies. For code, I appreciate well-structured, maintainable TypeScript.

## System Architecture

### UI/UX Decisions
The platform uses React with Vite for the dashboard and marketing website, and Expo React Native for the mobile app. The dashboard features comprehensive sidebar navigation and consistent CRUD interfaces. The mobile app prioritizes an offline-first, native-like experience with GPS and Red Tractor compliance forms. Design tokens and a Tailwind preset are shared via `lib/shared-assets`. Error boundaries are implemented for graceful error handling.

### Technical Implementations
The monorepo uses `pnpm workspaces` with Node.js 24 and TypeScript 5.9.

**API Server (`artifacts/api-server`):**
- Built with Express 5, supporting a multi-tenant architecture.
- Authentication handled by Clerk.
- Manages tenant context, roles, and module-based permissions.
- Provides routes for various farm-specific modules, authentication, and administration.

**Database Layer (`lib/db`):**
- Utilizes PostgreSQL with Drizzle ORM, comprising over 70 tables.
- Covers authentication, core tenant data, leads, support, and all farm management modules (e.g., fields, crops, livestock, equipment, financial).
- Specific models include Dairy Bulk Tank, Farm Services (customers, service agreements, grain intakes, invoicing, equipment hire), Vet Ledger (visits, medicines, invoices), and extended Insurance schema.
- Includes `field_season_land_use` for tracking non-crop land use and an extended `fieldsTable` for Land Tenure information.

**Dashboard (`artifacts/dashboard`):**
- React + Vite application using `wouter` for routing and TanStack React Query for data fetching.
- Authentication handled by Clerk.
- Features an onboarding wizard, tenant/farm selection management with Zustand, quick access cards, activity feed, and a compliance health panel.
- Implements module gating to filter navigation based on active subscriptions.

**Mobile App (`artifacts/mobile`):**
- Expo React Native app (SDK 54) with `expo-router` for routing.
- Offline-first architecture using SQLite/AsyncStorage with sync queue, connectivity detection, and exponential backoff retries.
- Features GPS-tagged records, visitor logging, Red Tractor compliance forms, and field boundary mapping.
- Includes a `ref_cache` SQLite layer for syncing reference data.
- All 15 record-capture screens include a shared `PhotoAttachButton` component (camera/library picker) and `uploadPhotoToStorage` utility; captured photo paths are persisted on each record as `documentUrl`.

**Marketing Website (`artifacts/website`):**
- React + Vite application with `wouter` for routing.
- Includes marketing pages, pricing, contact information, cookie consent, and GDPR-compliant privacy policies.

**Test Dashboard (`artifacts/test-dashboard`):**
- A login-free development and testing version of the dashboard, sharing the same React source.
- Uses environment variables for authentication bypass and mock admin access.

**Production Readiness:**
- API server performs environment variable audit.
- React apps use error boundaries, loading skeletons, and error states with retry.
- Supports Xero-compatible CSV export and Red Tractor compliance export.
- Advanced features for modules like Spray Records, Sales & Trading, Financial Records, Soil Tests (with sensor integration), Grain Storage, Workshop, Health & Safety, and Crop Trials.
- An admin panel supports full support ticket workflow and a dedicated BDE Admin Portal for extensive management features.
- Seed data (`seedDefaults.ts`) for various modules are added for demo purposes.

### Multi-Tenant Architecture
- Each client is a tenant managing multiple farms.
- Users are authenticated and linked to tenants.
- System roles (BDE Super Admin, Client Admin, Farm Manager, Farm Staff) define module-based permissions.
- Subscriptions are managed per-farm and per-module. The `status` column supports `'active'`, `'trial'`, `'cancelled'`, and `'past_due'`.
- **Trial lifecycle**: Admin portal has a per-farm "Start Trial" button (admin route: `POST /api/admin/tenants/:tenantId/farms/:farmId/start-trial`) that bulk-provisions all modules with `status='trial'` and a 30-day `currentPeriodEnd`. Idempotent — skips modules already active or on trial. Dashboard API (`/farms/:farmId/dashboard`) includes non-expired trial subs in `activeSubscriptions`, making them visible to the Sidebar. Sidebar shows an amber/red/green trial countdown banner with a "Choose a Plan" CTA whenever trial subscriptions are present.
- API requests are tenant-scoped using the `x-tenant-slug` header.

### System Roles
1. BDE Super Admin: Full internal platform access.
2. Client Admin: Full tenant management access.
3. Farm Manager: Full access to assigned farms.
4. Farm Staff: Limited module-based access.

### Modules
The platform supports 17 core compliance modules with monthly pricing, covering areas like Field & Crop Management, Sprays & Inputs, Soil Management, Livestock Management, Biosecurity, and Financial Records. A dedicated Dairy Management module provides detailed tracking.

#### Organic Farming Section
The sidebar contains a dedicated "Organic Farming" section with three modules:

**Organic Compliance** (key: `organic-compliance`, £12/mo) — covers five tabs: Certification, Field Status, Inspections, Restricted Inputs, and Input Register. Both the Input Register and Restricted Inputs forms include:
- **Substance picker** (SubstancePicker component) searching Annex I (permitted inputs) and Annex II (restricted plant protection products) from UK retained EC 889/2008.
- **Supplier combobox** (SupplierCombobox component) — searches the farm's Trade Contacts list via `GET /api/farms/:farmId/suppliers`.
- **Purchase Order lookup** — dropdown filtered by selected supplier via `GET /api/farms/:farmId/purchase-orders`, stores PO number as `poReference` text field.
- **GRN / Delivery Note lookup** — dropdown filtered by selected PO via `GET /api/farms/:farmId/stock-deliveries`, stores GRN number as `grnReference` text field.
- Schema: `organicInputsTable` and `organicRestrictedInputTable` in `lib/db/src/schema/organic.ts`.

**Organic Livestock** (key: `organic-livestock`, £25/mo) — page at `/organic-livestock`, four tabs:
- Conversion: tracks herds/flocks through organic conversion. **Linked to core Livestock Register**: herd selector auto-populates species/name from `herd_flock_register`; on save, sets `isOrganicHerd=true` on the linked herd (propagates organic status to Medicine, Movement, Feed modules). Shows banner of already-organic herds.
- Feed Records: logs feed purchases per species with supplier approval numbers, organic %, PO/GRN references, and derogation tracking.
- Outdoor Access / Stocking: records pasture area, stocking density, outdoor access hours/day, and housing period justifications.
- Treatment Compliance: **dual-source view** — medicine records with `isOrganicTreatment=true` from the core Medicine Register appear automatically in green rows at the top (read-only, no double-entry). Standalone organic treatment records appear below. Shows organic withdrawal end dates (doubled period).
- Schema: `organicLivestockConversionTable`, `organicLivestockFeedTable`, `organicLivestockOutdoorAccessTable`, `organicLivestockTreatmentTable`.
- API routes: `/api/farms/:farmId/organic-livestock/{conversion,feed,outdoor-access,treatments}`.

**Organic Dairy** (key: `organic-dairy`, £20/mo) — page at `/organic-dairy`, four tabs:
- Herd Conversion: **linked to core Livestock Register** — same herd-linkage pattern as Organic Livestock; marks selected herd as organic on save with certifier/cert-number propagated.
- Milk Collections: logs each tanker collection with volume, fat/protein/SCC/TBC quality data, organic certification status, and net value in pence.
- Feed & Nutrition: feed records with dry-matter weight, organic percentage, and derogation references.
- Treatment Compliance: **dual-source view** — same medicine register integration as Organic Livestock. Dairy columns track both organic milk and meat withdrawal end dates.
- Schema: `organicDairyHerdConversionTable`, `organicDairyCollectionTable`, `organicDairyFeedTable`, `organicDairyTreatmentTable`.
- API routes: `/api/farms/:farmId/organic-dairy/{herd-conversion,collections,feed,treatments}`.

**Cross-module organic integration (no double-entry):**
- `herd_flock_register`: `isOrganicHerd`, `organicCertBody`, `organicCertNumber`, `organicConversionStartDate` — set automatically when linking a herd from Organic Livestock/Dairy modules.
- `livestock_medicine_records`: `isOrganicTreatment`, `doubledWithdrawalDays`, `organicWithdrawalEndDate`, `certifierNotified`, `certifierNotifiedDate`, `maxTreatmentsReached` — organic vet records surface in Organic Livestock + Dairy treatment tabs automatically.
- `feed_deliveries`: `isOrganicApproved`, `organicSupplierApprovalNumber`, `organicPercentage`, `nonOrganicIngredientDerogation` — organic fields in Feed Management delivery dialog; organic badge shown in delivery card list.
- `livestock_movements`: `isOrganicMovement`, `organicCertRef`, `organicWithdrawalsClear`, `organicStatusConfirmedBy`.
- `harvestRecordsTable` + `grainSalesTable`: `isOrganicCertified` + `organicCertRef` — shown in Harvest Records and Sales & Trading pages.
- `organic.ts` tables: FK columns `herdId`, `feedDeliveryId`, `medicineRecordId`, `fieldId` link organic module records to core register entries.

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
- **Authentication:** Clerk
- **Email:** Brevo SMTP, Titan IMAP
- **AI Integration:** OpenAI (gpt-5-mini)
- **SMS Notifications:** Twilio
- **Mobile Development:** Expo SDK 54, expo-router, expo-auth-session, expo-location, expo-image-picker, expo-haptics, expo-crypto
- **Mobile Storage:** SQLite, AsyncStorage, SecureStore
- **Mapping:** react-native-maps
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Routing:** wouter, expo-router