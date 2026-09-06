# Harvest vintage restoration regression

## Purpose

Confirm on a physical phone that Harvest History restores the last selected
vintage for the current farm and falls back safely when the stored vintage no
longer has harvest records.

## Test fixture

Use a signed-in farm with harvest records in at least two vintages. Note the
newest available vintage and choose an older vintage for the restoration check.

## Real-device flow

1. On the phone, open **Harvest History** and select a non-current vintage.
2. Confirm the analytics chart and summary both show that vintage's data.
3. Leave the screen using normal app navigation, then reopen **Harvest History**
   for the same farm.
4. Pass restoration when the previously selected vintage is still selected and
   both the chart and summary still show that vintage's data.
5. Change the saved preference to a year with no harvest records, or remove the
   selected vintage's records using the test fixture.
6. Leave and reopen **Harvest History** so the preference and farm records load
   again.
7. Pass fallback when the newest available vintage is selected and its chart
   and summary are shown. The screen must not remain empty under the unavailable
   saved year.

Record the device model, OS version, app build, farm fixture, selected older
vintage, and expected newest vintage with the release check.

## Automated guards

Run:

```sh
pnpm --filter @workspace/mobile test -- \
  __tests__/usePersistedVintage.test.ts \
  __tests__/harvestVintageSelection.test.ts \
  --runInBand
```

The hook check covers farm-scoped AsyncStorage restoration and corrupt values.
The resolver check covers restoration of an available year and fallback to the
newest available year. The phone flow covers navigation, native storage, and
the chart/summary rendering that unit tests cannot prove.