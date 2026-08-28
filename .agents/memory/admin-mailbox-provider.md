---
name: Admin mailbox provider
description: Why the admin inbox uses 123 Reg legacy IMAP through a fixed-egress proxy.
---

The admin mailbox is a 123 Reg account hosted on its legacy IMAP service. Do not switch it to Titan solely because current Titan documentation recommends Titan endpoints; the same valid mailbox credentials are rejected by Titan.

**Why:** Live authentication checks confirmed that the mailbox credentials work on the 123 Reg legacy service and fail with `AUTHENTICATIONFAILED` on Titan. A successful 123 Reg webmail login does not imply the account was migrated to Titan.

**How to apply:** When changing inbox connectivity, test both TLS reachability and authenticated login without exposing credentials. Keep the IMAP host configurable, preserve the verified 123 Reg service unless the mailbox itself is migrated, and route production IMAP through the configured fixed-egress SOCKS/HTTP CONNECT proxy.

Replit Autoscale outbound IPs can change after republishing. A republish moved production onto an egress route that timed out against every 123 Reg backend even though the same credentials and endpoints still worked from development. DNS-address failover alone therefore is not durable for this mailbox.

**Why:** The legacy provider appears sensitive to the deployment's outbound route, while Autoscale does not guarantee a static egress IP. A fixed-egress proxy keeps the mailbox traffic on stable addresses across publishes and scale events.

Production use has since been confirmed working again after configuring the Fixie SOCKS endpoint and republishing the API.