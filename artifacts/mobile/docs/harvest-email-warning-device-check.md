# Harvest email warning release-device check

## Purpose

Confirm the long-report warning and native email handoff without depending on
saved harvest records or a healthy harvest records API. The fixture exists only
in memory, does not alter farm data, and its control is removed from production
builds.

Run this check in Expo Go or a development build on each release phone.

## iPhone and Android

1. Sign in, then open **Viticulture → Harvest History**. The check works even if
   the screen has no records or reports that harvest records could not load.
2. In the header, tap the amber warning-triangle button labelled **Dev check
   harvest email warning**.
3. Confirm **Email may be cut off** appears. This proves the generated encoded
   email body exceeds 1,800 characters.
4. Tap **Cancel**. Confirm the warning closes and no email app opens.
5. Tap the amber warning-triangle button again, then tap **Open email anyway**.
6. Confirm the phone hands the message to its real email app and opens a draft
   titled **Harvest Report — Development Device Check (2026 fixture)**.
7. Discard the draft. No message needs to be sent.

Record the device model, OS version, and app build with the release-check
result.

## Production guard

Repeat step 1 in the production release candidate and confirm the amber
device-check button is absent. Normal harvest email remains available when real
harvest records exist.