---
name: Drizzle wraps pg errors — 23505 catch must check err.cause.code
description: Why duplicate-key (unique index) catches in api-server routes silently fail and return 500 instead of 409, and the correct pattern.
---

Drizzle's `db.execute` throws a `DrizzleQueryError` that wraps the underlying pg error. `err.code` is undefined on the wrapper; the Postgres error code (e.g. `23505` unique violation) lives on `err.cause.code`.

**Why:** The winery-fermentation POST/PUT handlers had try/catch blocks checking `(err as {code?:string}).code === "23505"` — they looked correct, passed typecheck, and were assumed done, but a live duplicate insert still surfaced as a raw 500. Other winery handlers (e.g. cellar ops) using `err?.code === "23505"` have the same latent bug.

**How to apply:** Any 23505→409 guard around drizzle queries must check both:
```ts
const pgCode = (err as { code?: string })?.code ?? (err as { cause?: { code?: string } })?.cause?.code;
if (pgCode === "23505") { /* 409 */ }
```
Always verify with a live duplicate request (dev-bypass curl), not just by reading the catch block.
