---
name: Persisted filter hook
description: Shared per-farm filter persistence for dashboard pages
---
`usePersistedFilter` / `usePersistedNumberFilter` in `artifacts/dashboard/src/hooks/use-persisted-filter.ts` persist in-tab filters (year/species/etc.) in localStorage keyed `${page}-${filter}-filter-${farmId}` with stale-value validation.
**Why:** Completion review rejects partial coverage — when a task says "persist filters on a module page", ALL that page's filter useStates must be converted, including ones in split-out section files (e.g. livestock/MortalitySection.tsx), not just the highest-traffic ones.
**How to apply:** New filter persistence should reuse this hook with a unique page key; year filters use isValid `v === "all" || /^\d{4}$/`.
Also: the dup-batch-ref validation command fails with exit 2 if the api-server workflow isn't running — start it before markTaskComplete.
