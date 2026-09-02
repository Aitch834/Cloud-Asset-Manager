---
name: API typecheck project references
description: How to distinguish stale shared-library declarations from real API route type errors.
---

When API typecheck reports that a generated request field or database column does not exist even though the current shared-library source contains it, rebuild the referenced composite library before changing the route.

**Why:** API TypeScript project references consume emitted declarations. OpenAPI generation or database schema edits can update source while leaving declarations stale, producing misleading route errors that move to another field after only one library is rebuilt.

**How to apply:** Rebuild `lib/api-zod` after generated API schema changes and `lib/db` after database schema changes, then rerun API typecheck. Only edit the route if the error remains against freshly emitted declarations.