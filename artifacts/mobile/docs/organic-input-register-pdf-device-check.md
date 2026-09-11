# Organic Input Register PDF device check

Run this check in the release build with a farm that has at least one fully
synced Organic Input record containing values in every register field.

## iOS

1. Open **Organic Compliance → Organic Inputs**.
2. Confirm the record no longer shows a pending-sync badge.
3. Tap **Print / Share PDF**.
4. Confirm the native iOS share sheet opens and identifies the attachment as
   `organic-input-register.pdf`.
5. Save the attachment to Files, open it, and rotate the phone to landscape.
6. Confirm the table is readable and contains all twelve headings listed below.

## Android

1. Open **Organic Compliance → Organic Inputs**.
2. Confirm the record no longer shows a pending-sync badge.
3. Tap **Print / Share PDF**.
4. Confirm the native Android share sheet opens and identifies the attachment
   as `organic-input-register.pdf`.
5. Save the attachment, open it in the device PDF viewer, and rotate the phone
   to landscape.
6. Confirm the table is readable and contains all twelve headings listed below.

## Twelve-column check

The PDF must show: Date Used, Product, Input Type, Supplier, PO Reference,
GRN / Delivery, Approval Status, Derogation Expiry, Certifier Ref, Field / Area,
Quantity, and Notes.

## Web regression check

Open the same screen in the web preview and tap **Print / Share PDF**. Confirm a
new browser print window opens rather than a native share prompt.