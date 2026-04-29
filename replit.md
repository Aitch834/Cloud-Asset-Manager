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
The sidebar contains a dedicated "Organic Farming" section with four modules:

**Organic Compliance** (key: `organic-compliance`, £12/mo) — covers five tabs: Certification, Field Status, Inspections, Restricted Inputs, and Input Register. Both the Input Register and Restricted Inputs forms include:
- **Substance picker** (SubstancePicker component) searching Annex I (permitted inputs) and Annex II (restricted plant protection products) from UK retained EC 889/2008.
- **Supplier combobox** (SupplierCombobox component) — searches the farm's Trade Contacts list via `GET /api/farms/:farmId/suppliers`.
- **Purchase Order lookup** — dropdown filtered by selected supplier via `GET /api/farms/:farmId/purchase-orders`, stores PO number as `poReference` text field.
- **GRN / Delivery Note lookup** — dropdown filtered by selected PO via `GET /api/farms/:farmId/stock-deliveries`, stores GRN number as `grnReference` text field.
- Schema: `organicInputsTable` and `organicRestrictedInputTable` in `lib/db/src/schema/organic.ts`.

**Organic Livestock** (key: `organic-livestock`, £25/mo) — page at `/organic-livestock` (`OrganicLivestockPage.tsx`), four tabs:
- Conversion: tracks herds/flocks through organic conversion. **Linked to core Livestock Register**: herd selector auto-populates species/name from `herd_flock_register`; on save, sets `isOrganicHerd=true` on the linked herd. Shows banner of already-organic herds.
- Feed Records: logs feed purchases per species with supplier approval numbers, organic %, PO/GRN references, and derogation tracking.
- Outdoor Access / Stocking: records pasture area, stocking density, outdoor access hours/day, and housing period justifications.
- Treatment Compliance: **dual-source view** — medicine records with `isOrganicTreatment=true` surface automatically (read-only); standalone organic treatment records appear below. Shows doubled withdrawal end dates.
- All tabs use **view-before-edit** dialogs (Eye → view → Edit button opens form).
- **Print report** buttons on all four tabs produce printable compliance summaries with farm name header and current date.
- Schema: `organicLivestockConversionTable`, `organicLivestockFeedTable`, `organicLivestockOutdoorAccessTable`, `organicLivestockTreatmentTable`.
- API routes: `/api/farms/:farmId/organic-livestock/{conversion,feed,outdoor-access,treatments}`.

**Organic Dairy** (key: `organic-dairy`, £20/mo) — page at `/organic-dairy` (`OrganicDairyPage.tsx`), four tabs:
- Herd Conversion: **linked to core Livestock Register** — same herd-linkage pattern as Organic Livestock; marks selected herd as organic on save with certifier/cert-number propagated.
- Milk Collections: logs each tanker collection with volume, fat/protein/SCC/TBC quality data, organic certification status, and net value in pence.
- Feed & Nutrition: feed records with dry-matter weight, organic percentage, and derogation references.
- Treatment Compliance: **dual-source view** — same medicine register integration as Organic Livestock. Dairy columns track both organic milk and meat withdrawal end dates.
- All tabs use **view-before-edit** dialogs. **Print report** buttons on all four tabs.
- Schema: `organicDairyHerdConversionTable`, `organicDairyCollectionTable`, `organicDairyFeedTable`, `organicDairyTreatmentTable`.
- API routes: `/api/farms/:farmId/organic-dairy/{herd-conversion,collections,feed,treatments}`.

**Organic Fresh Produce** (key: `organic-fresh-produce`, £18/mo) — page at `/organic-fresh-produce` (`OrganicFreshProducePage.tsx`), four tabs:
- Block Status Register: tracks organic conversion status of growing blocks (in-conversion / fully-organic / non-organic). Links to `horticultureBlocksTable` via `blockId`. Shows conversion progress bar, days remaining, certifying body. **View-before-edit** dialogs; if the block has a parent field (fieldId), the view dialog shows field name, reference, NVZ badge, and Organic badge. **Print report** button.
- Input Log: logs organic-approved inputs applied per block. Supplier lookup via datalist from `/api/farms/:farmId/suppliers` (graceful 403 fallback). PO Ref and GRN Ref get supplier-filtered suggestions from existing records. Applied By uses `StaffSelect` component (from `/api/farms/:farmId/members`). **View-before-edit** dialogs; **Print report** button.
- Certificates: stores organic certification records per certifying body. **View-before-edit** dialogs; **Print report** button.
- Buyer Declarations: logs buyer declaration forms issued per buyer. **View-before-edit** dialogs; **Print report** button.
- Schema: `horticultureBlockStatusTable`, `horticultureInputLogTable`, `organicCertificateTable`, `buyerDeclarationTable` in `lib/db/src/schema/horticulture.ts`.
- API routes: `/api/farms/:farmId/organic/{block-status,input-log,certificates,buyer-declarations}`.

**Growing Blocks (Fresh Produce)** — non-organic page at `/fresh-produce` (`FreshProducePage.tsx`). The Blocks tab manages `horticultureBlocksTable`:
- `fieldId` (optional FK → `fieldsTable`) — allows blocks to be linked to a parent farm field on mixed farms. Added via schema migration. GET endpoint LEFT JOINs fieldsTable to return `fieldName`, `fieldReference`, `fieldIsNvz`, `fieldIsOrganic`.
- Block table shows Parent Field column. View dialog shows a parent field panel with NVZ/Organic badges when linked. Add/edit form has an optional Parent Field picker dropdown populated from `/api/farms/:farmId/fields`.
- Schema: `lib/db/src/schema/horticulture.ts`; `fieldsTable` in `lib/db/src/schema/fields-crops.ts`.

**Cross-module organic integration (no double-entry):**
- `herd_flock_register`: `isOrganicHerd`, `organicCertBody`, `organicCertNumber`, `organicConversionStartDate` — set automatically when linking a herd from Organic Livestock/Dairy modules.
- `livestock_medicine_records`: `isOrganicTreatment`, `doubledWithdrawalDays`, `organicWithdrawalEndDate`, `certifierNotified`, `certifierNotifiedDate`, `maxTreatmentsReached` — organic vet records surface in Organic Livestock + Dairy treatment tabs automatically.
- `feed_deliveries`: `isOrganicApproved`, `organicSupplierApprovalNumber`, `organicPercentage`, `nonOrganicIngredientDerogation` — organic fields in Feed Management delivery dialog; organic badge shown in delivery card list.
- `livestock_movements`: `isOrganicMovement`, `organicCertRef`, `organicWithdrawalsClear`, `organicStatusConfirmedBy`.
- `harvestRecordsTable` + `grainSalesTable`: `isOrganicCertified` + `organicCertRef` — shown in Harvest Records and Sales & Trading pages.
- `organic.ts` tables: FK columns `herdId`, `feedDeliveryId`, `medicineRecordId`, `fieldId` link organic module records to core register entries.

#### Mobile App — Organic Screens
The Expo mobile app (`artifacts/mobile`) includes organic data-entry screens accessible from the Organic Overview quick-actions grid:
- `organic-fp-input.tsx` — Fresh Produce input log entry (product, quantity, unit, block, purpose, date).
- `organic-outdoor-access.tsx` — Outdoor access recording (species, date, hours, pasture area, stocking density, weather, compliance notes).
- `organic-treatment.tsx` — Organic treatment recording (species, animal ID, product, dose, route, vet name, withdrawal dates, certifier notification).
- Types: `OrganicFpInput`, `OrganicOutdoorAccess`, `OrganicTreatment` in `artifacts/mobile/lib/types.ts`.
- Storage keys: `ORGANIC_FP_INPUTS`, `ORGANIC_OUTDOOR_ACCESS`, `ORGANIC_TREATMENTS` in `artifacts/mobile/lib/storage.ts`.
- Quick Actions grid on `organic-overview.tsx` is a 2×2 layout linking to all four organic entry screens.

## P1/P2 Compliance Gap Features (implemented April 2026)

The following features were added to close identified Red Tractor / APHA compliance record-keeping gaps:

### New DB Tables (`lib/db/src/schema/compliance-gaps.ts`)
- `bde_tb_tests` — bovine TB test register (APHA-required)
- `bde_welfare_outcome_assessments` — WOA records (Red Tractor Beef & Lamb, Dairy)
- `bde_ppe_issue_records` — PPE issue register (PPE at Work Regs 1992)
- `bde_contractors` — contractor H&S file (PLI, RAMS, induction — CDM 2015)
- `bde_sheep_dipping_records` — sheep dipping/pour-on records (COSHH, MAPP compliance)

### Schema Changes
- `livestock_movements` table: added `ata_number` and `ata_expiry_date` columns for Animal Transporter Authorisation tracking
- `farm_departments` table (`farmDepartmentsTable`) added — id, farmId, tenantId, name, description, colour, isActive, timestamps
- `farm_members` table: `departmentId` nullable FK to `farm_departments` added

### New API Routes (`artifacts/api-server/src/routes/farms.ts`)
Full CRUD routes (GET/POST/PUT/DELETE) for each of the 5 new tables under the pattern `/api/farms/:farmId/[resource]` gated on `requireModuleByKey`.
- GET/POST/PUT/DELETE `/farms/:farmId/departments` — department CRUD
- GET `/farms/:farmId/members` — now LEFT JOINs `farm_departments`, returns `departmentId`, `departmentName`, `departmentColour`
- POST/PUT `/farms/:farmId/members[/:id]` — accept `departmentId` in body
- GET `/farms/:farmId/task-report?period=...` — period-based task report; LEFT JOINs members → departments; periods: this-week / last-week / this-month / last-month / last-3-months

### Dashboard Features
- **Staff → Farm Departments panel** — collapsible panel at top of Staff page; add/edit/delete departments with name, description, colour; department badge shown on each staff row; department picker in Add + Edit member dialogs
- **Task Board → Reports tab** — Board/Reports toggle; period picker (This Week / Last Week / This Month / Last Month / Last 3 Months); hierarchical grouping Module → Department → Staff; count pills (Completed / In Progress / Pending / Cancelled); expandable rows showing individual tasks with status/date; print button (window.print)
- **Livestock → TB Tests tab** — view-before-edit, print TB test report
- **Livestock → Welfare Outcomes tab** — WOA records with corrective action tracking and print report
- **Livestock → Sheep Dipping tab** — COSHH-compliant dipping records with print report
- **Staff & Training → PPE Register tab** — PPE issue log with staff acknowledgement tracking and print
- **Contractors H&S File page** (`/contractors`) — standalone page for contractor PLI/RAMS/induction records; sidebar nav item under H&S section
- **Vet Ledger → AMRM Report tab** — antibiotic usage report aggregated from medicine records; keyword-based classification into 10 antibiotic classes with HP-CIA (Fluoroquinolones, 3rd/4th gen Cephalosporins, Polymyxins) flagging; year picker; printable annual summary with vet sign-off block
- **Movements form** — added ATA Number and ATA Expiry Date fields for commercial transporter tracking

### Help Centre Articles (7 new, IDs 10064–10070)
TB Tests, AMRM, WOA, PPE Register, Contractor H&S, Sheep Dipping, ATA Number

### Website Updates
- `Features.tsx` — 5 new bullet points in Livestock section (TB Test Register, WOA, Sheep Dipping, AMRM, ATA); 1 in Staff & Training (PPE Issue Register); 1 in Safety, Risk & Audits (Contractor H&S File)
- `Pricing.tsx` — updated notes for livestock-management, staff-training, safety-risk-audits modules

### Seed Data
- `seedDefaults.ts` — updated module descriptions for `livestock-management`, `staff-training`, `risk-waste` modules

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