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