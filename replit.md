# Workspace

## Overview
This project is a pnpm workspace monorepo for BDE Farm Trac, a multi-tenant farm management and compliance platform. It provides comprehensive tools for field, crop, livestock, financial, and regulatory compliance (e.g., Red Tractor) for farmers. The platform includes a React web dashboard, an Expo React Native mobile app, a marketing website, and an Express API server. The primary goal is to streamline farm operations, ensure compliance, offer valuable insights, and establish a significant presence in the agricultural technology market.

## User Preferences
I prefer clear and direct communication. When making changes, prioritize iterative development and explain the high-level approach before diving into code. Ask for confirmation before implementing significant architectural changes or adding new external dependencies. For code, I appreciate well-structured, maintainable TypeScript.

## System Architecture

### UI/UX Decisions
The platform utilizes React with Vite for the dashboard and marketing website, and Expo React Native for the mobile application. The dashboard features extensive sidebar navigation and consistent CRUD interfaces. The mobile app is designed for an offline-first, native-like experience, incorporating GPS functionality and Red Tractor compliance forms. Design tokens and a Tailwind preset are shared via `lib/shared-assets`. Error boundaries are implemented across applications for robust error handling.

### Technical Implementations
The monorepo is built using `pnpm workspaces` with Node.js 24 and TypeScript 5.9.

**API Server (`artifacts/api-server`):**
- Developed with Express 5, supporting a multi-tenant architecture.
- Authentication is managed by Clerk.
- Handles tenant context, user roles, and module-based permissions.

**Database Layer (`lib/db`):**
- Uses PostgreSQL with Drizzle ORM, featuring 90+ tables.
- Encompasses authentication, core tenant data, and all farm management modules (e.g., fields, crops, livestock, equipment, financial).
- Includes specialized tables for Dairy Bulk Tank, Farm Services, Vet Ledger, and extended Insurance schemas.
- Incorporates `field_season_land_use` and extended `fieldsTable` for land tenure tracking.
- **Sheep production tables** (9): sheep_flocks, sheep_tupping_records, sheep_scanning_records, sheep_weigh_records, sheep_shearing_records, sheep_cull_records, sheep_vaccination_programmes, sheep_disease_monitoring, sheep_red_tractor_checklists.
- **Beef production tables** (5): beef_weigh_records, beef_animal_weigh_entries, beef_finishing_records, beef_deadweight_settlements, beef_red_tractor_checklists.
- **Grain store log tables**: grain_drying_log, grain_conditioning_log (simple schema matching StorageLocationsPage).

**Dashboard (`artifacts/dashboard`):**
- React + Vite application, utilizing `wouter` for routing and TanStack React Query for data fetching.
- Integrates Clerk for authentication.
- Features an onboarding wizard, tenant/farm selection, quick access cards, activity feed, and a compliance health panel.
- Implements module gating to control navigation based on active subscriptions.
- TB Test dialog (Livestock → TB Tests tab) upgraded: herd/flock select from herd register, animal ear tags textarea with auto-count, vet name datalist suggestions, and file upload replacing URL+name text fields. Uses `useUpload` from `@workspace/object-storage-web`.

**Mobile App (`artifacts/mobile`):**
- Expo React Native app (SDK 54) with `expo-router`.
- Offline-first architecture with SQLite/AsyncStorage, sync queue, connectivity detection, and exponential backoff retries.
- Provides GPS-tagged record-keeping, visitor logging, Red Tractor compliance forms, and field boundary mapping.
- Includes a `ref_cache` SQLite layer for reference data synchronization.
- All record-capture screens include a shared `PhotoAttachButton` and `uploadPhotoToStorage` utility, persisting photo paths as `documentUrl`.
- TB Test screen upgraded: herd picker modal (from `useApiHerds`), RFID ear-tag scanning via `RFIDTagInput` with multi-tag array + auto animalsTested count, vet name suggestions from offline cache, and `PhotoAttachButton` for document attachment.

**Marketing Website (`artifacts/website`):**
- React + Vite application with `wouter` for routing, covering marketing content, pricing, and legal information.

**Test Dashboard (`artifacts/test-dashboard`):**
- A login-free development and testing version of the dashboard, sharing the same React source.
- Uses environment variables for authentication bypass and mock admin access.

**Production Readiness:**
- API server includes environment variable auditing.
- React applications feature error boundaries, loading skeletons, and error states with retry mechanisms.
- Supports Xero-compatible CSV export and Red Tractor compliance export.
- Includes advanced features for modules like Spray Records, Sales & Trading, Financial Records, Soil Tests, Grain Storage, Workshop, Health & Safety, and Crop Trials.
- An admin panel provides support ticket workflow and extensive BDE Admin Portal management features.

### Multi-Tenant Architecture
- Each client operates as a tenant, managing multiple farms.
- Users are authenticated and linked to specific tenants.
- System roles (BDE Super Admin, Client Admin, Farm Manager, Farm Staff) define module-based permissions.
- Subscriptions are managed per-farm and per-module, with statuses for active, trial, cancelled, and past due.
- Trial lifecycle management allows administrators to provision trial modules with a 30-day period.
- API requests are tenant-scoped using the `x-tenant-slug` header.

### System Roles
1. BDE Super Admin: Full internal platform access.
2. Client Admin: Full tenant management access.
3. Farm Manager: Full access to assigned farms.
4. Farm Staff: Limited module-based access.

### Modules
The platform supports 17 core compliance modules with monthly pricing, covering Field & Crop Management, Sprays & Inputs, Soil Management, Livestock Management, Biosecurity, and Financial Records. A dedicated Dairy Management module is also included.

#### Organic Farming Section
A dedicated "Organic Farming" section in the sidebar includes four modules: Organic Compliance, Organic Livestock, Organic Dairy, and Organic Fresh Produce. These modules feature comprehensive forms with substance pickers, supplier lookups, purchase order/GRN references, and integration with core farm records. They also include "view-before-edit" dialogs and print report functionalities. Cross-module organic integration prevents double-entry for data such as herd registration, medicine records, feed deliveries, and livestock movements, automatically updating relevant core tables.

### P1/P2 Compliance Gap Features
Recent additions address Red Tractor / APHA compliance gaps, including new database tables for bovine TB tests, welfare outcome assessments, PPE issue records, contractors, and sheep dipping records. Schema changes include `ata_number` and `ata_expiry_date` in `livestock_movements` and the addition of `farm_departments`. New API routes and dashboard features provide full CRUD functionality for these new tables, staff department management, an enhanced task board, and dedicated compliance tabs within the dashboard (e.g., TB Tests, Welfare Outcomes, Sheep Dipping, PPE Register). A new standalone Contractors H&S File page and an AMRM Report tab in the Vet Ledger have also been implemented.

### Crop Rotation Planner — Persistent DB-backed Implementation
- **`CropRotationPlanner`** component in `artifacts/dashboard/src/pages/Fields.tsx` fully rewritten (was 100% ephemeral in-browser state):
  - Fetches `GET /api/farms/:farmId/field-crops` and `GET /api/farms/:farmId/crops` on mount
  - Dynamic year range: `currentYear - 4` to `currentYear + 4` (9 columns); current year highlighted in green
  - Past year columns labelled "confirmed" (grey header), current year "▶ current", future "planned" (blue-tinted)
  - Each cell maps to a real `field_crop_assignments` record; green dot indicates a saved DB record
  - Cell change immediately persists: DELETE (clearing), PATCH `cropId` (updating), or POST (new assignment)
  - "Find or create" crop logic: if a generic rotation category (e.g. "Wheat") isn't yet in `cropsTable`, creates it automatically
  - Dropdown optgroups: "Farm Crops" (farm's registered varieties) and "Rotation Categories" (generic fallback list)
  - OSR interval and diversity warnings calculated from live DB data plus any pending changes
  - Per-field notes saved to the current year's assignment on blur
  - `fieldsLoading` prop passed from parent to prevent premature "no fields" empty state during initial load
- **Backend `artifacts/api-server/src/routes/farms.ts`**:
  - `PATCH /farms/:farmId/field-crops/:id` extended to accept `cropId` updates (previously notes-only)
  - New `DELETE /farms/:farmId/field-crops/:id` endpoint added (with farm ownership validation)
- `useToast` import added to `Fields.tsx`; `useMemo` added to React import

### Dairy Management Module — Milk Records Overhaul
- **`dairy_milk_records`** table gained 13 new columns: `milk_buyer`, `temp_tested_by`, `abr_tested_by`, `abr_test_kit_lot`, `abr_test_kit_batch`, `buyer_lab_results_status` (not-applicable/pending/received/concern), `buyer_lab_results_date`, `buyer_lab_ref`, `buyer_scc_thousands`, `buyer_tbc_cfu_ml`, `buyer_fat_percent`, `buyer_protein_percent`, `buyer_lactose_percent`.
- **`dairy_milk_collections`** table gained 7 pricing columns: `pence_per_litre`, `gross_value_pence`, `quality_bonus_pence`, `quality_penalty_pence`, `transport_deduction_pence`, `net_payment_pence`, `statement_ref`.
- **New `dairy_abr_test_kit_stock`** table: tracks ABR kit batches with lot/batch numbers, expiry dates, purchase quantity, used quantity, remaining quantity, and low-stock thresholds. Stock auto-decrements when a milk record is saved with a linked kit.
- **Drizzle schema** in `lib/db/src/schema/livestock.ts` updated to reflect all new columns and the new table.
- **API** (`artifacts/api-server/src/routes/farms.ts`): POST/PUT milk-records and milk-collections updated for all new fields; full CRUD for `/dairy/abr-test-kit-stock`.
- **Dashboard MilkRecordsTab** (`artifacts/dashboard/src/pages/DairyPage.tsx`): restructured dialog into 3 labelled sections (Collection Details / On-Farm Measurements / Buyer Lab Results); buyer lab results status workflow with `LabResultsBadge`; tester identity, ABR kit lot/batch fields; kit stock picker auto-decrements stock; document attachments in view dialog; `RecordAttachments` component wired to new view dialog.
- **Dashboard BulkTankTab**: milk collection list shows net payment badge and ppl; collection view dialog shows full payment breakdown; collection add/edit dialog has "Payment & Settlement" section (ppl, gross, bonus, penalty, transport, net).
- **Dashboard ABR Kit Stock**: new `AbrKitStockSection` collapsible panel inside BulkTankTab showing per-kit stock level, lot/batch, expiry, low-stock warnings.
- **Mobile milk-statement.tsx**: photo attachment added via `expo-image-picker` — Camera and Library buttons, thumbnail grid, tap-to-remove.

## Publishing / Deploying to Production

Replit's **Publish** button triggers each artifact's production build automatically via `[services.production] build` in each `artifact.toml`. No manual step is required before Publish — the builds run in the production environment where dev-server workflows are not running, so memory pressure is low.

**Build order wired into Publish:**
| Artifact | Build command (artifact.toml) |
|---|---|
| API server | `lib/db` rebuild → `pnpm --filter @workspace/api-server run build` |
| Website | `PORT=19161 BASE_PATH=/ pnpm --filter @workspace/website run build` |
| Admin portal | `PORT=25580 BASE_PATH=/admin-portal/ pnpm --filter @workspace/admin-portal run build` |
| Dashboard | `PORT=23183 BASE_PATH=/dashboard/ pnpm --filter @workspace/dashboard run build` |

The API server's build command rebuilds `lib/db` as its first step so compiled declarations are always fresh before the esbuild bundle runs.

**Manual pre-publish verification (optional):** `scripts/build-prod.sh` replicates the API server + website + admin-portal builds locally. Dashboard is excluded from the script because it requires ~3 GB of free RAM that competing dev-server workflows consume; Publish runs it cleanly in production. See `.agents/memory/dashboard-build-oom.md` for the manual dashboard build recipe if needed.

## External Dependencies

- **Monorepo Tool:** pnpm workspaces
- **API Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Authentication:** Clerk
- **AI Integration:** OpenAI (gpt-5-mini)
- **SMS Notifications:** Twilio
- **Mobile Development:** Expo SDK 54, expo-router, expo-auth-session, expo-location, expo-image-picker
- **Mobile Storage:** SQLite, AsyncStorage, SecureStore
- **Mapping:** react-native-maps
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Routing:** wouter, expo-router