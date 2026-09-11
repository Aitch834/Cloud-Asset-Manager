# Vine Operations History PDF release-device check

Run the automated native handoff check before the release candidate:

```sh
pnpm --filter @workspace/mobile run test:vine-operations-pdf-native-handoff
```

It verifies that distinctive pruning and canopy values are passed unchanged to
Expo Print on both iOS and Android. It does not replace this final
physical-device share-preview smoke check.

Use a release build on one iPhone and one Android phone with at least one
synced Vine Operations record containing a pruning system, target and actual
bud counts, pruning weight, shoots removed percentage, and leaves removed
zone.

## iPhone

1. Open **Viticulture → Vine Operations History**.
2. Confirm the record is no longer pending sync, then tap **Export PDF**.
3. Confirm the iOS share sheet opens with `vine-operations-history.pdf`.
4. Preview the PDF from the share sheet.
5. Confirm the Pruning / canopy detail row contains each of the six recorded
   values and is readable without clipping.
6. Share the PDF to Files or Mail, then open the shared copy successfully.

## Android

1. Open **Viticulture → Vine Operations History**.
2. Confirm the record is no longer pending sync, then tap **Export PDF**.
3. Confirm the Android share sheet opens with `vine-operations-history.pdf`.
4. Open the PDF in the device PDF viewer.
5. Confirm the Pruning / canopy detail row contains each of the six recorded
   values and is readable without clipping.
6. Share the PDF to Files or email, then open the shared copy successfully.

## Detail-row check

The PDF must show: pruning system, target buds/vine, actual buds/vine, pruning
weight, shoots removed, and leaves removed zone.