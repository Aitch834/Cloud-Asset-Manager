# Agri-environment milestone completion date picker regression

## Purpose

Prevent a paid milestone from being saved with a completion date in the future. The
native picker is responsible for enforcing the date limit, so this check must be
performed on both supported mobile platforms.

## Device check

Use a signed-in mobile session with an agri-environment project containing a
milestone that can be edited.

### iOS

1. Open the milestone detail screen and enter edit mode.
2. Tap **Completion date** to open the spinner picker.
3. Try to advance the day beyond today's date.
4. Confirm the spinner cannot select a date after today. If the spinner is moved
   to the boundary, the selected value must remain today (or an earlier date).
5. Save the edit and confirm the completion date shown on the detail screen is
   not in the future.

### Android

1. Open the same milestone detail screen and enter edit mode.
2. Tap **Completion date** to open the Android date dialog.
3. Try to select tomorrow or any later date.
4. Confirm dates after today are unavailable/disabled. If the device allows an
   attempted future selection, dismiss/confirm it and verify the form retains
   today (or an earlier date), never the attempted future date.
5. Save the edit and confirm the completion date shown on the detail screen is
   not in the future.

## Automated source guard

`__tests__/agri-env-milestone-date-picker.test.ts` checks that both the Android
`DateTimePickerAndroid.open` options and the iOS `DateTimePicker` include
`maximumDate: new Date()` / `maximumDate={new Date()}`. This protects the native
picker boundary from being removed during a refactor; the device steps above
confirm the platform behavior.