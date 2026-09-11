# Vine Register email release-device check

This physical-device smoke check confirms that Vine Register email actions hand
their generated `mailto:` URL to the installed mail app. Run it on a release
build on one iPhone and one Android phone.

## Fixtures

Use a Viticulture-enabled farm with at least one Vine Register entry.

Prepare two register states:

1. A normal register whose email action opens without a length warning.
2. A long register that shows **Email may be cut off**. Add or use enough
   entries for the encoded email body to exceed the warning threshold.

Use a farm name and entry values that are easy to identify in the composer.

## iPhone

1. Install and open the release build on an iPhone with a mail app configured.
2. Open **Viticulture → FSA Vine Register** using the normal register fixture.
3. Tap the mail icon.
4. Confirm the installed mail app opens a new composer.
5. Confirm the subject starts with **FSA Vine Register —** and includes the
   fixture farm name.
6. Confirm the body includes the farm name, register summary, column headings,
   and the fixture entry.
7. Return to the app and open the long-register fixture.
8. Tap the mail icon and confirm **Email may be cut off** appears.
9. Tap **Open email anyway**.
10. Confirm the installed mail app opens a new composer with the subject and
    body populated.

## Android

Repeat the iPhone steps on an Android release build. Confirm Android opens the
installed mail composer or app chooser and preserves the populated subject and
body for both the normal and **Open email anyway** paths.

## Missing-mail-app check

On either platform, use a device or test profile with no app registered for
`mailto:` links:

1. Open the normal register fixture and tap the mail icon.
2. Confirm the app remains usable and shows **Could not open email** with
   **No email app was found on this device.**
3. Repeat with the long register and tap **Open email anyway**. Confirm the same
   error appears.

## Pass criteria and evidence

The check passes only when:

- both iPhone and Android release builds open the native mail composer for the
  normal path;
- both release builds open it after **Open email anyway**;
- the generated subject and body remain populated in all four composer checks;
  and
- the missing-handler path shows the existing error.

Record the device model, OS version, app build, farm fixture, and result for
each path. A simulator, web preview, Expo Go, or mocked linking call does not
replace this release-device check.

## Automated guards

Before the device check, run:

```sh
pnpm --filter @workspace/mobile run check:external-urls
pnpm --filter @workspace/mobile run typecheck
```

These checks confirm the dynamic `mailto:` value is routed through the shared
external URL helper and that the mobile project type-checks. They cannot prove
that an installed iOS or Android mail app accepts the handoff.