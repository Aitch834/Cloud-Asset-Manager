---
name: Admin mailbox provider
description: Why the admin inbox must use the 123 Reg legacy IMAP service rather than Titan.
---

The admin mailbox is a 123 Reg account hosted on its legacy IMAP service. Do not switch it to Titan solely because current Titan documentation recommends Titan endpoints; the same valid mailbox credentials are rejected by Titan.

**Why:** Live authentication checks confirmed that the mailbox credentials work on the 123 Reg legacy service and fail with `AUTHENTICATIONFAILED` on Titan. A successful 123 Reg webmail login does not imply the account was migrated to Titan.

**How to apply:** When changing inbox connectivity, test both TLS reachability and authenticated login without exposing credentials. Keep the IMAP host configurable, and preserve the verified 123 Reg service unless the mailbox itself is migrated.

The production Admin Portal inbox was confirmed working after adding failover across the resolved 123 Reg backend addresses.