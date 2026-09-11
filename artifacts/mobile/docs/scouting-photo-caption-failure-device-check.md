# Scouting-photo caption failure device check

## Purpose

Confirm that a caption failure after a successful scouting-photo upload is
non-blocking: the grower sees **Caption wasn’t saved.** and the uploaded photo
remains in the list after its normal reload.

Run this only from a development build or Expo Go session connected to the
development API. The control is not included in release builds, and the API
ignores its request flag outside development.

## iOS and Android steps

1. Sign in to a viticulture-enabled farm and open **Records → Vineyard Disease
   Scouting**. Save a scouting record if the photo section is not already
   visible.
2. In **Photos**, tap **Dev check: next caption save works normally**. Confirm
   it changes to **Dev check: next caption save will fail**.
3. Tap **Add Photo**, select or take a photo, and wait for the **Add a Caption?**
   prompt. Enter a short caption and tap **Save**.
4. Confirm the prompt closes and the non-blocking **Caption wasn’t saved.**
   warning appears.
5. Wait for the photo list to reload. Confirm the new photo is retained in the
   list, while its caption is absent. Do not disable Wi-Fi or mobile data.
6. Upload another photo and save a caption without arming the control. Confirm
   that caption saves normally; the control is one-shot and resets before the
   deliberate failed request.

Record the device model, OS version, app build, and scouting record used with
the release-check result.

## Automated checks

```sh
pnpm --filter @workspace/mobile run test:scouting-photo-caption-failure-check
pnpm --filter @workspace/api-server run test:scouting-photo-access
```

The mobile check proves a release build cannot send the special header. The API
check proves development receives the deliberate `503` without changing the
photo and production ignores the same header.