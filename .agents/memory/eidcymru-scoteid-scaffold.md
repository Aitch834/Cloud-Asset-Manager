---
name: EIDCymru and ScotEID integration boundary
description: EIDCymru’s current documented SOAP transport and the provider boundary needed for its future replacement.
---

EIDCymru movement reporting must use the documented EWS SOAP service, authenticated with each keeper’s username/password plus EIDCymru-registered application name and version. Its staging and production endpoints are both real services: staging is for genuine test requests, never a locally simulated success. Keep the EIDCymru transport behind a provider boundary so EWS can be replaced when EIDCymru introduces its successor API without rewriting movement records or their UI.

**Why:** The former speculative JSON API-key adapter was incompatible with EIDCymru’s EWS specification. The service has also indicated EWS is transitional, so coupling SOAP payloads into the movement workflow would make the upcoming migration unnecessarily risky.

**How to apply:** Store only encrypted keeper credentials and safe status metadata; never store or return plaintext credentials. Submit sheep/goat on/off and between-holding movements through the adapter, distinguish accepted-with-warnings from failures, and retain EIDCymru’s returned `Mid` as the movement reference. Continue to use the Wales-specific movement UI and ledger independently of the transport implementation.