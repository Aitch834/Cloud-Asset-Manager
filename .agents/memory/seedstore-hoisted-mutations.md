---
name: SeedStorePage hoisted-mutations pattern
description: useMutation calls moved to early fiber positions (5–12) using a _mut ref bag to avoid position-specific "Invalid hook call" crash on navigation.
---

## The problem
SeedStorePage had 21 hooks before the first `useMutation` call (hook 22).
The test-dashboard's @react-refresh no-op stub prevents `performReactRefresh()`, but the crash was still occurring at hook 22 on navigation from another page.

## The fix
All 8 `useMutation` calls hoisted to hook positions 5–12 (right after `useAppStore`, `useToast`, `useQueryClient`).

Because the mutation callbacks reference state declared by later `useState` hooks (TDZ issue prevents plain closure capture from compiling cleanly), a **`_mut` ref bag** is used:

```typescript
const _mut = useRef<any>({});

const saveMut = useMutation({
  mutationFn: async (body) => {
    const { safeFarmId, editing } = _mut.current;  // live state via ref
    ...
  },
  onSuccess: () => {
    const { toast, invalidate, setOpen, setForm, setEditing, editing } = _mut.current;
    ...
  },
});

// ... all 8 mutations hoisted here ...

// Original useState / useQuery hooks follow in unchanged order

// At the END of all hook declarations, refresh the ref:
_mut.current = { safeFarmId, toast, editing, setEditing, setOpen, setForm, ... };
```

**Why this is safe:**
- Mutation callbacks only run on user interaction — well after render completes, so `_mut.current` is always populated.
- TanStack Query v5 stores mutation options in internal refs per render; using `_mut.current` gives the same "latest value" guarantee.
- `useRef` itself is hook position 4, mutations 5–12, then all original hooks at 13+.

## CRITICAL: when hoisting, REMOVE the originals
When adding hoisted declarations at the top, the original declarations lower in the file MUST be deleted in the same edit. If both exist, Babel throws `"Identifier 'X' has already been declared"` during Vite's startup warmup. This silently prevents dep pre-discovery; on first navigation Vite discovers those deps mid-render → `vite:beforeFullReload` → session-token rotation → dual-React window → "Invalid hook call". The crash looks like a hook-position bug but is actually a warmup-failure bug. TypeScript `tsc` does NOT catch this (const-redeclaration in same scope is a Babel/runtime error, not always a TS error). After fixing duplicates, **restart the test-dashboard** so a clean warmup runs.

## Apply this pattern when
Any page where `useMutation` appears below a large number of `useState`/`useQuery`/`useMemo` calls AND exhibits "Invalid hook call" on navigation in the test-dashboard. ContractorsPage (7 hooks before useMutation) works fine; SeedStorePage (21 hooks before useMutation) crashed.

## Infrastructure context
The test-dashboard also has SW v7 + @react-refresh no-op stub + FORCE_PAD_PAGES (SeedStorePage always padded to 512 KB+ by vite.config.ts middleware) to prevent the primary crash mechanism. The hoisted-mutations fix is a complementary defence against hook-position-specific crashes.
