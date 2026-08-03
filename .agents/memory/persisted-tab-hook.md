---
name: Persisted tab hook
description: All dashboard multi-tab pages persist their active tab via a shared hook
---
Every top-level tabbed dashboard page persists its active tab per farm via `usePersistedTab` in `artifacts/dashboard/src/hooks/use-persisted-tab.ts` (storage key `${page}-active-tab-${farmId}`; validates ids, farm re-sync, URL `?tab=` override wins on first mount and is not persisted).

**Why:** avoids per-page copy-paste of the lazy-initializer + wrapped-setter pattern and keeps page keys unique.
**How to apply:** any NEW tabbed page must use this hook (unique kebab-case page key) instead of a plain `useState` tab. ViticulturePage/OrganicViticulturePage still use the inline pattern (predate the hook).
