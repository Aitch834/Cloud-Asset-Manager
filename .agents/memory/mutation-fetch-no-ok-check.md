---
name: Silent mutation failures — fetch without res.ok check
description: Dashboard useMutation calls built on bare fetch() never reject on HTTP errors, so onError toasts never fire and success toasts show on 500s.
---

Many dashboard mutations use `mutationFn: (body) => fetch(url, {...})` with no `res.ok` check. fetch only rejects on network failure, so a 500 resolves normally: onSuccess fires, a success toast shows, and the destructive onError toast never appears.

**Why:** Found while e2e-verifying failure toasts — SprayPage showed "Application recorded" after an intercepted 500. A grep found ~480 more write-mutations (POST/PUT/DELETE) in artifacts/dashboard/src with the same pattern.

**Status (2 Aug 2026):** Fixed across artifacts/dashboard/src via `artifacts/dashboard/scripts/fix-mutation-ok.mjs` (idempotent codemod: bracket-matches write-method fetch calls, injects an ok-check `.then`, skips code that already inspects `.ok`/`.status`). Re-run it after adding new pages, or reuse it for other artifacts (admin-portal etc.).

**How to apply:** Any mutationFn using fetch must `.then(r => { if (!r.ok) throw new Error(...); return r; })` (or check res.ok in an async body). To e2e-verify a failure toast, have the testing agent intercept the exact endpoint via page.route → fulfill 500, then assert a toast whose root class contains "destructive". Also note: the farm id in the dev DB can be 1, not 2 — log actual requests before assuming intercept patterns.
