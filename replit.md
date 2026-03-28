# Workspace

## Overview
This project is a pnpm workspace monorepo using TypeScript, designed for BDE Farm Trac, a comprehensive farm management and compliance platform. It provides a multi-tenant solution for farmers to manage operations, including field, crop, livestock, financial, and regulatory compliance (e.g., Red Tractor). The platform features a React web dashboard, an Expo React Native mobile app for field use, a marketing website, and an Express API server. The business vision is to streamline farm operations, ensure compliance, provide valuable insights, and capture a significant share of the agricultural technology market.

## User Preferences
I prefer clear and direct communication. When making changes, prioritize iterative development and explain the high-level approach before diving into code. Ask for confirmation before implementing significant architectural changes or adding new external dependencies. For code, I appreciate well-structured, maintainable TypeScript.

## System Architecture

### UI/UX Decisions
The platform uses React with Vite for the dashboard and marketing website. The dashboard features comprehensive sidebar navigation for 17+ compliance modules and a generic `ModulePage` for consistent CRUD interfaces. The mobile app, built with Expo React Native, prioritizes an offline-first experience with a native-like UI, GPS-enabled features, and Red Tractor compliance forms. Design tokens and a Tailwind preset are shared via `lib/shared-assets`. Error boundaries are implemented for graceful error handling in React applications.

### Technical Implementations
The monorepo is structured with `pnpm workspaces`, using Node.js 24 and TypeScript 5.9.

**API Server (`artifacts/api-server`):**
- Built with Express 5, implementing a multi-tenant architecture.
- Handles user authentication via Replit Auth (OpenID Connect with PKCE).
- Resolves tenant context from `x-tenant-slug` header and manages roles and module-based permissions.
- Features routes for health checks, authentication, leads, support, tenant management, roles, billing, and farm-specific modules.
- Seeds default roles and modules on startup.

**Database Layer (`lib/db`):**
- Utilizes PostgreSQL with Drizzle ORM.
- Comprises 60+ tables across multiple schema files covering authentication, core tenant data, leads, support, and all farm-specific modules (e.g., fields, crops, livestock, equipment, financial).
- `farm_locations` table provides a named registry of farm buildings and areas.

**Dashboard (`artifacts/dashboard`):**
- React + Vite application with `wouter` for routing and TanStack React Query for data fetching.
- Uses Zustand for managing and persisting tenant/farm selection.
- Implements a fetch-patch interceptor to automatically attach the `x-tenant-slug` header.

**Mobile App (`artifacts/mobile`):**
- Expo React Native app (SDK 54) with `expo-router` for file-based routing.
- **Offline-first architecture:** Uses SQLite (native) or AsyncStorage (web) with a sync queue that includes ordered processing, connectivity detection, and exponential backoff retries.
- Features GPS-tagged records, visitor logging, Red Tractor compliance forms, and field boundary mapping.
- Platform-aware code splits for native and web functionalities.

**Marketing Website (`artifacts/website`):**
- React + Vite application with `wouter` for routing.
- Includes marketing pages, pricing, and contact information.
- Cookie consent banner with granular preferences.
- Privacy policy and cookies policy pages for GDPR compliance.

**Test Dashboard (`artifacts/test-dashboard`):**
- A login-free copy of the dashboard for development and testing, sharing the same React source code.
- Uses environment variables for authentication bypass during development, injecting mock super-admin access.

**Production Readiness:**
- API server performs a detailed environment variable audit at startup.
- Error boundaries are implemented in React apps at top-level and per-route.
- ModulePage components include loading skeletons and error states with retry functionality.
- Provides Xero-compatible CSV export for financial data and Red Tractor compliance export (CSV/JSON).
- Dashboard features include an activity feed, quick access cards with live record counts, and a compliance health panel with live checks.
- Specific modules like **SprayPage**, **NMPPage**, **NVZPage**, **DocumentsPage**, **SoilTestsPage**, **BiosecurityPage**, **MedicinePage**, and **Stock & Supplier Management** have dedicated implementations with advanced features and compliance-specific functionalities.
- **WorkshopPage now has 5 tabs only**: Assets & QR Codes, Job Cards, Service Schedule, Fleet Overview, Parts Store. PAT Testing, Fire Safety, Risk Assessments, and COSHH have been moved to the `risk-waste` module (RiskAssessmentsPage at `/risks`).
- **Workshop Parts Store** (5th tab in WorkshopPage): self-contained parts inventory within the Workshop module. `stock_items` table now has `stockType` (chemical | workshop-part | consumable) and `unitCostPence` columns. API routes: `GET/POST/PUT/DELETE /api/farms/:farmId/workshop/parts`, `POST /api/farms/:farmId/workshop/parts/receive` (creates GRN-WS-* delivery + movement + increments stock level), `POST /api/farms/:farmId/workshop/parts/use` (issues parts, decrements level, auto-updates job `partsCostPence`), `GET /api/farms/:farmId/workshop/parts/movements`. Job card dialog has an inline "Issue Parts from Store" panel (shows when editing an existing job, queries workshop parts, posts to /use endpoint). When `stock-suppliers` module is not subscribed, supplier dropdown gracefully shows "None" only. Parts catalogue now has **client-side search/filter** (text + category dropdown). Clicking a part row opens a **right-side detail panel** showing stock level, details fields, and a **Documents section** (list + upload via object storage). Document schema: `workshop_part_documents` table (id, stockItemId FK w/ cascade, filename, storageKey, mimeType, fileSizeBytes, uploadedBy, uploadedAt). Document API routes: `GET/POST /api/farms/:farmId/workshop/parts/:partId/documents`, `DELETE /api/farms/:farmId/workshop/parts/:partId/documents/:docId`. Storage download URL: `/api/storage${storageKey}`. Panel closes on Escape key or X button (aria-label="Close panel").
- **Health, Safety & Risk Management** (`risk-waste` module, DB key unchanged): RiskAssessmentsPage (`/risks`) now has 4 tabs — Risk Assessments, COSHH Records, PAT Testing, Fire Safety. PAT Testing routes (`/api/farms/:farmId/workshop/pat-tests`) and Fire Extinguisher routes (`/api/farms/:farmId/workshop/fire-extinguishers`) are now gated by `risk-waste` module (previously `workshop-management`). Module renamed in DB and seedDefaults.ts. Sidebar label updated to "Health, Safety & Risk". Week-ahead task hrefs for PAT/fire now point to `/risks`.
- **Crop Trials** module supports full trial lifecycle: plot design with GPS lat/lng coordinates, treatment logging, growth stage observations, yield comparisons. Includes a **Map View** tab (Leaflet, satellite tiles, field boundaries coloured by trial status, numbered GPS plot pins, click-through popups) and a **Full Trial Report** print function (available on harvested/completed trials). Crop year filter spans all event-log pages.
- **`GET /api/farms/:farmId/fields/boundaries/all`** endpoint returns all field boundaries in one request (used by TrialMapView and future map features).
- `cropTrialPlotsTable` stores `latitude` and `longitude` (nullable numeric) for GPS-located plots.
- **Mobile GPS screen** (`artifacts/mobile/app/crop-trials.tsx`): walk-up-to-plot flow — select trial → select plot → capture GPS with expo-location → save coordinates back to API. Shows GPS-saved status per plot.
- An admin panel supports full support ticket workflow.
- OpenAPI specification and generated TypeScript client are kept in sync.

### Multi-Tenant Architecture
- Each client organization is a tenant, potentially managing multiple farms.
- Users are authenticated via Replit Auth and linked to tenants.
- System roles (BDE Super Admin, Client Admin, Farm Manager, Farm Staff) are seeded with module-based permissions.
- Subscriptions are managed per-farm and per-module, integrated with Stripe.
- API requests are scoped to a tenant using the `x-tenant-slug` header.

### System Roles
1. BDE Super Admin: Full platform access (internal).
2. Client Admin: Full tenant management access.
3. Farm Manager: Full access to assigned farms.
4. Farm Staff: Limited module-based access.

### Modules
The platform supports 17 core compliance modules, each with monthly pricing, covering areas such as Field & Crop Management, Sprays & Inputs, Soil Management, Livestock Management, Biosecurity, and Financial Records. A dedicated **Dairy Management module** includes detailed tracking for milk, mastitis, calving, body condition scoring, mobility scoring, bulk tank records, and dry cow therapy, with corresponding mobile app forms and Help Centre articles.

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
- **Authentication:** Replit Auth (OpenID Connect with PKCE)
- **AI Integration:** OpenAI (gpt-5-mini for support chat)
- **SMS Notifications:** Twilio (paid add-on module)
- **Mobile Development:** Expo SDK 54, expo-router, expo-auth-session, expo-location, expo-image-picker, expo-haptics, expo-crypto
- **Mobile Storage:** SQLite (native), AsyncStorage (web), SecureStore (native)
- **Mapping:** react-native-maps (native)
- **State Management:** Zustand (for dashboard)
- **Data Fetching:** TanStack React Query (for dashboard)
- **Routing:** wouter (for web apps), expo-router (for mobile)