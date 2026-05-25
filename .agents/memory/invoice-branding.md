---
name: Invoice branding & business info
description: Farm logo upload, company/VAT numbers, bank details, payment terms — where they live in schema and UI
---

## Schema
All 9 new columns live in `farmsTable` (lib/db/src/schema/core.ts):
`company_number`, `vat_number`, `bank_name`, `bank_account_name`,
`bank_account_number`, `bank_sort_code`, `payment_terms_days` (default 30),
`invoice_footer_text`, `invoice_logo_path`.
DB migration run via ALTER TABLE.

## Logo storage
Uploaded via `useUpload()` hook (no options — path is auto-generated).
`response.objectPath` is stored as `invoiceLogoPath` in farms table.
Served via `/api/storage/objects/{path}` — cookie auth works from print
windows because they're same-origin blob: URLs in the same browser session.

## Print documents
`docHeader()` in FarmServicesPage.tsx accepts the full FarmRecord and
renders logo + company/VAT numbers in the header; all existing print
functions (agreements, grain certs, hire, invoices) share this header.
`printInvoice()` additionally renders a payment details panel + footer text.

**Why:** Customer-facing documents (invoices, hire agreements) need to carry
the farm's legal identity and payment instructions to be valid in commerce.
