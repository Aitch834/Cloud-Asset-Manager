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
- Subscriptions are managed per-farm and per-module.
- API requests are tenant-scoped using the `x-tenant-slug` header.

### System Roles
1. BDE Super Admin: Full internal platform access.
2. Client Admin: Full tenant management access.
3. Farm Manager: Full access to assigned farms.
4. Farm Staff: Limited module-based access.

### Modules
The platform supports 17 core compliance modules with monthly pricing, covering areas like Field & Crop Management, Sprays & Inputs, Soil Management, Livestock Management, Biosecurity, and Financial Records. A dedicated Dairy Management module provides detailed tracking.

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