---
name: React Query shared queryKey data shape
description: When multiple components share a queryKey, the raw queryFn result is cached — select is per-observer only. Mismatched shapes cause crashes on cache hits.
---

## Rule
When two or more components share the same React Query `queryKey`, the **raw queryFn result** is what gets stored in the cache. The `select` option is applied **per-observer** at read time — it is never stored.

If component A extracts data inside the queryFn chain (e.g. `.then(d => d.records ?? [])`) and has no `select`, but component B stores the raw response (and uses `select: d => d.records ?? []`), then:

- Component B runs first → cache stores `{ records: [...] }`  
- Component A runs next → cache hit → A gets `{ records: [...] }` (the raw object) even though its queryFn would have returned an array — because the queryFn is **not re-run on a cache hit**  
- A then tries `.map()` on an object → **crash**

## Why
Found in BDE Farm Trac: `EnvironmentalFeaturesTab` and `SlurryTab` both used `queryKey: ["fields", farmId]`. EnvironmentalFeaturesTab stored the raw JSON and used `select`; SlurryTab extracted records in the queryFn chain with no `select`. Clicking Slurry tab after Features caused "TypeError: .map is not a function" every time.

## How to apply
- All components sharing a `queryKey` should use the **same queryFn shape** (return the raw API response) and apply transformations via `select`.
- Never rely on the queryFn chain to shape data when the key is shared — `select` is the correct per-observer transformation point.
- Pattern to follow: `queryFn: () => fetch(...).then(r => r.json())` + `select: (d: any) => d.records ?? []`
