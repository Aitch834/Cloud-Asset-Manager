---
name: TanStack Query shared-key cache-shape mismatch
description: When two components share a queryKey but have different queryFn return shapes, the second component gets the first component's cached shape — causing crashes if it calls array methods on the result.
---

## The rule

When two sections share the same queryKey (e.g. `["herds", farmId]`), only the **first-registered queryFn** ever runs. All subsequent observers get the cached result — regardless of what their own queryFn would have returned.

**Why:** TanStack Query v5 deduplicates fetches by key. The queryFn is that of whichever observer registered the key first (typically the default tab / component that mounts first).

## How to apply

**Never unwrap arrays inside queryFn** for a key that other sections also use. Always return the **raw API response** and extract the array **outside** the query:

```tsx
// WRONG — if another section caches { records: [...] } under the same key,
// this component will receive { records: [...] } not an array:
const { data: herds = [] } = useQuery({
  queryKey: ["herds", farmId],
  queryFn: () => fetch(...).then(r => r.json()).then(d => d.records ?? []),
});

// CORRECT — match the canonical shape; normalise at access point:
const { data: herdsRaw } = useQuery<{ records: any[] } | null>({
  queryKey: ["herds", farmId],
  queryFn: () => fetch(...).then(r => r.json()),
});
const herds: any[] = Array.isArray(herdsRaw) ? herdsRaw : (herdsRaw?.records ?? []);
```

The `Array.isArray` guard makes the component safe regardless of which queryFn populated the cache.

## Why the default `= []` doesn't help

`const { data: herds = [] }` only uses the default when `data === undefined` (query still loading). If the cache already has `{ records: [...] }`, `data` is defined — it's the wrong-shaped object. The default is ignored.

## The crash path in LivestockPage

- `HerdsSection` (default tab) caches `["herds", farmId]` as `{ records: Herd[] }`
- `BvdTestingSection` navigated to next — gets `{ records: [...] }` not an array
- `herds.map(...)` inside `<DialogContent>` is **always evaluated** even when `open={false}` (React evaluates JSX children eagerly before any component can short-circuit)
- `TypeError: herds.map is not a function` → ErrorBoundary → "Something went wrong"
- Replit console serialises the TypeError as `{}` (Error properties are non-enumerable → `JSON.stringify(TypeError) === "{}"`)
