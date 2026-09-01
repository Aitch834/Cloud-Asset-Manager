---
name: LIS OAuth HMAC state
description: OAuth state for LIS CLA sign-in uses HMAC-SHA256 signing, not a DB-stored nonce — avoids dev/prod database split problem.
---

## Rule
The LIS OAuth state parameter is a cryptographically signed token. Never go back to DB-stored nonces for this flow.

**Format:** `{hmacHex}.{timestamp}|{farmId}|{base64url(returnUrl)}`  
**Secret:** `process.env.CREDENTIAL_ENCRYPTION_KEY`  
**Expiry:** 1 hour  
**Functions:** `signLisOAuthState(farmId, returnUrl)` / `verifyLisOAuthState(state)` in `artifacts/api-server/src/routes/farms.ts`

## Why
Dev API server and production API server (`api.bdefarmtrac.co.uk`) use different databases. The old DB-nonce approach failed because authorize ran on dev (storing nonce in dev DB) but the callback always hits production (checking prod DB — empty). HMAC verification needs only the shared secret, which is the same in both environments.

## Critical import detail
`createHmac` and `timingSafeEqual` must be imported from the Node.js `"crypto"` module:
```typescript
import { createHmac, timingSafeEqual } from "crypto";
```
The global `crypto` object (Web Crypto API / `globalThis.crypto`) does NOT have `createHmac` or `timingSafeEqual`. Using `crypto.createHmac(...)` without the named import silently produces `undefined is not a function` at runtime.

Hex signatures must be validated with an exact-length hexadecimal regex before
calling `Buffer.from(signature, "hex")`. Node's hex decoder can silently ignore
a trailing non-hex character, so buffer comparison alone can accept a malformed
token whose valid signature is followed by junk.

## How to apply
Any future OAuth state generation/validation in this codebase should use the same HMAC pattern — not DB nonces — to remain robust across dev/prod.
