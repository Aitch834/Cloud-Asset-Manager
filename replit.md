# Workspace

## Overview
This project is a pnpm workspace monorepo using TypeScript, designed for BDE Farm Trac, a comprehensive farm management and compliance platform. Its primary purpose is to provide a multi-tenant solution for farmers to manage various aspects of their operations, from field and crop management to livestock, financial records, and regulatory compliance (e.g., Red Tractor). The platform includes a React-based web dashboard, an Expo React Native mobile application for field use, a marketing website, and an Express API server. The business vision is to streamline farm operations, ensure compliance, and provide valuable insights to farmers, aiming to capture a significant share of the agricultural technology market.

## User Preferences
I prefer clear and direct communication. When making changes, prioritize iterative development and explain the high-level approach before diving into code. Ask for confirmation before implementing significant architectural changes or adding new external dependencies. For code, I appreciate well-structured, maintainable TypeScript.

## System Architecture

### UI/UX Decisions
The platform utilizes React with Vite for both the dashboard and marketing website. The dashboard features a comprehensive sidebar navigation for 17+ compliance modules and a generic `ModulePage` component for consistent CRUD interfaces. The mobile app, built with Expo React Native, focuses on an offline-first experience with a native-like UI, including GPS-enabled features and Red Tractor compliance forms. Design tokens and a Tailwind preset are shared across applications via `lib/shared-assets`. Error boundaries are implemented in React apps for graceful error handling.

### Technical Implementations
The monorepo is structured with `pnpm workspaces`, using Node.js 24 and TypeScript 5.9.
**API Server (`artifacts/api-server`):**
- Built with Express 5, implementing a multi-tenant architecture.
- Handles user authentication via Replit Auth (OpenID Connect with PKCE).
- Resolves tenant context from `x-tenant-slug` header and manages roles and module-based permissions.
- Features dedicated routes for health checks, authentication, leads, support, tenant management, roles, billing, and farm-specific modules.
- Seeds default roles and modules on startup.

**Database Layer (`lib/db`):**
- Utilizes PostgreSQL with Drizzle ORM.
- Comprises over 60 tables across multiple schema files covering authentication, core tenant data, leads, support, and all farm-specific modules (e.g., fields, crops, livestock, equipment, financial).

**Dashboard (`artifacts/dashboard`):**
- React + Vite application with `wouter` for routing and TanStack React Query for data fetching.
- Uses Zustand for managing and persisting tenant/farm selection.
- Implements a fetch-patch interceptor to automatically attach the `x-tenant-slug` header.

**Mobile App (`artifacts/mobile`):**
- Expo React Native app (SDK 54) with `expo-router` for file-based routing.
- **Offline-first architecture:** Uses SQLite (native) or AsyncStorage (web) with a sync queue that includes ordered processing, connectivity detection, and exponential backoff retries.
- Features GPS-tagged records, visitor logging, Red Tractor compliance forms, and field boundary mapping.
- Platform-aware code splits for native and web functionalities (e.g., `FieldMap.tsx` and `FieldMap.web.tsx`).
- Auth tokens are stored securely using SecureStore (native) or localStorage (web).

**Marketing Website (`artifacts/website`):**
- React + Vite application with `wouter` for routing.
- Includes standard marketing pages, pricing, and contact information.
- Cookie consent banner with granular preferences (essential/analytics/marketing).
- Privacy policy and cookies policy pages for GDPR compliance.
- User-friendly 404 page with navigation back to home and support.

**Test Dashboard (`artifacts/test-dashboard`):**
- Login-free copy of the dashboard sharing the exact same React source code.
- Runs on port 3002 at `/test-dashboard/`. Selectable from the Replit preview dropdown as "artifacts/test-dashboard: web".
- Auth bypass is controlled by `VITE_DEV_BYPASS_AUTH=true` and `VITE_DEV_BYPASS_TOKEN=bde-dev-bypass-local` (baked into its `vite.config.ts`). These bypass the login page and inject `X-Dev-Bypass` into every API request.
- On the API server, `devBypassMiddleware` (active only in `NODE_ENV=development`) accepts the token and injects a mock super-admin user — no DB session needed.
- `tenantMiddleware` grants bypass users super-admin access to any tenant without a DB membership record.
- `GET /tenants/mine` with bypass returns all active tenants so the select screen works.
- Any change to `artifacts/dashboard/src/` is immediately reflected in the test dashboard via HMR.

**Production Readiness:**
- API server performs detailed env var audit at startup — logs ✓/⚠/✗ per variable, masks secret values, fails fast with actionable error if required vars are missing. Tracked vars: PORT, DATABASE_URL, REPL_ID (required); ISSUER_URL, SESSION_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DEV_BYPASS_TOKEN (optional).
- Error boundaries wrap both React apps at the top level AND per-route in the dashboard (RouteErrorBoundary resets when navigation changes so a crash on one page doesn't kill the whole app).
- ModulePage has loading skeletons and error states with retry functionality.
- Xero-compatible CSV export for financial data with proper account code and VAT mapping.
- Red Tractor compliance export (CSV/JSON) at `/farms/:farmId/compliance-export`.
- Dashboard home activity feed queries real recent records from 6 farm data tables (spray applications, inspections, fields, equipment, soil tests, visitor logs).
- Dashboard Quick Access cards show live record counts from DB (fields, equipment, spray applications, inspections) — no hardcoded values.
- **Compliance Health Panel** on dashboard shows 6 live checks: Spray Applications, Product Register, NMP for current year, Field Coverage, Document Register, Operator Certificates — each links to the relevant page with OK/Attention/Action Required status.
- **SprayPage.tsx** (`/sprays`): Three tabs — Applications Log (expandable rows with weather data, operator/certificate), Product Register (MAPP number, category badges), Print/Export (printable assessor report). Replaces the old generic ModulePage.
- **NMPPage.tsx** (`/nmp`): Annual nutrient management plans with per-field N/P/K entries, organic manure type/rate, application method. Expandable plan cards with inline field entry table. Per-plan print/export for assessor visits. Route added to App.tsx and sidebar.
- **DocumentsPage.tsx** (`/documents`): Full document register replacing old generic ModulePage. Type/status filtering, expiry alerts (red=expired, amber=within 90 days), badge-coloured document types. Fields: title, type, reference number, issued by, issue/expiry dates, notes. Schema now includes `referenceNumber`, `issuedBy`, `issueDate`, `expiryDate` columns (pushed to DB).
- Admin panel (website) supports full support ticket workflow: list, view thread, reply, change status. Email notification is placeholder (console log).
- OpenAPI spec and generated TypeScript client kept in sync — after changing API response shapes, run `pnpm --filter @workspace/api-spec run codegen` then `cd lib/api-client-react && pnpm exec tsc --build`.
- **Stock & Supplier Management** (`/stock`): Full stock tracking module with 5 tabs — Stock Levels (live quantities with reorder alerts), Goods Received (delivery log), Movements (full in/out history), Product Catalogue (with category, MAPP number, product code, reorder levels), and Suppliers. Schema: `stockItemsTable` (product catalogue, now with `productCode`, `mappNumber`, `defaultSupplierId`), `stockDeliveriesTable` (goods received), `stockLevelsTable` (current balance), `stockMovementsTable` (full movement history with referenceType/referenceId). Auto-deduction: spray applications automatically create a stock movement (type: `usage`) and update `stockLevelsTable` when `sprayProductsTable.stockItemId` is set. Similarly, logging goods received auto-adds to stock levels. Manual adjustments and waste movements are supported via the Movements tab. `sprayProductsTable` now has `stockItemId` FK to link spray products to stock items.

### Multi-Tenant Architecture
- Each client organization is a tenant, potentially managing multiple farms.
- Users are authenticated via Replit Auth and linked to tenants.
- System roles (BDE Super Admin, Client Admin, Farm Manager, Farm Staff) are seeded, with permissions defined per role and module.
- Subscriptions are managed per-farm and per-module, integrated with Stripe.
- API requests are scoped to a tenant using the `x-tenant-slug` header.

### System Roles
1. BDE Super Admin: Full platform access (internal).
2. Client Admin: Full tenant management access.
3. Farm Manager: Full access to assigned farms.
4. Farm Staff: Limited module-based access.

### Modules
The platform supports 16 core compliance modules, each with monthly pricing, covering: Field & Crop Management, Sprays & Inputs, Soil Management, Equipment & Vehicle Management, Livestock Management, Biosecurity & Visitors, Staff & Training, Risk & Waste Management, Inspections & Audits, Environmental Features, Transport & Haulage, Stock & Supplier Tracking, Financial Records, Document Management, and Weather Tracking.

## External Dependencies

- **Monorepo Tool:** pnpm workspaces
- **Package Manager:** pnpm
- **API Framework:** Express 5
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **API Codegen:** Orval (from OpenAPI spec)
- **Build Tool:** esbuild
- **Payments:** Stripe (for subscription billing and webhooks)
- **Authentication:** Replit Auth (OpenID Connect with PKCE)
- **AI Integration:** OpenAI (for support chat - gpt-5-mini)
- **Mobile Development:** Expo SDK 54, expo-router, expo-auth-session, expo-location, expo-image-picker, expo-haptics, expo-crypto
- **Mobile Storage:** SQLite (native), AsyncStorage (web), SecureStore (native)
- **Mapping:** react-native-maps (native)
- **State Management:** Zustand (for dashboard)
- **Data Fetching:** TanStack React Query (for dashboard)
- **Routing:** wouter (for web apps), expo-router (for mobile)