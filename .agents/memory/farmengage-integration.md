---
name: Trimble PTx FarmEngage integration
description: OAuth setup and API docs for the FarmEngage integration — pending credential receipt from Trimble.
---

## Status (August 2026)
- Trimble contacted via api@ptxag.com (Blake Cartee)
- Registration email sent requesting Authorization Code Grant access
- Credentials and next steps pending from Trimble

## Our registration details sent to Trimble
- Grant type: Authorization Code Grant
- App name: BDE Farm Trac
- Logo: https://bdefarmtrac.co.uk/bde-farm-trac-logo.png
- Logout URL: https://api.bdefarmtrac.co.uk/api/farmengage/logout
- Redirect URL: https://api.bdefarmtrac.co.uk/api/farmengage/callback
- Contact: api@ptxag.com

## API documentation
- Full docs: https://api-docs.farmengage.com/

## Notes
- OAuth routes (authorize, callback, logout) not yet built — build when credentials arrive from Trimble
- Follow same pattern as Teltonika/John Deere/AGCO OAuth integrations
