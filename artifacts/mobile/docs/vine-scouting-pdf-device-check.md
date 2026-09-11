# Vine Scouting History PDF release-device check

Run this check in the release build on one iPhone and one Android phone. Use a
farm whose scouting history contains at least three synced records:

- one with a future next-scouting date;
- one with a past next-scouting date, shown as overdue; and
- one with no next-scouting date.

Use realistic long block names, actions, and notes so wrapping is exercised.

## iPhone

1. Open **Viticulture → Scouting History**.
2. Confirm the three records no longer show pending-sync state.
3. Tap **Export PDF**.
4. Confirm the iOS share sheet opens with `vine-scouting-history.pdf`.
5. Preview the PDF from the share sheet and inspect every page.
6. Confirm the landscape table shows all eight headings and that text wraps
   inside its own cell without clipping or overlapping.
7. Confirm the Next Scouting column includes a future date, an **Overdue** date,
   and **Next: Not scheduled**.
8. Print or open the iOS print preview and confirm all eight columns remain
   visible at the page edges.
9. Share the PDF to Files or Mail, then open the shared copy successfully.

## Android

1. Open **Viticulture → Scouting History**.
2. Confirm the three records no longer show pending-sync state.
3. Tap **Export PDF**.
4. Confirm the Android share sheet opens with `vine-scouting-history.pdf`.
5. Open the PDF in the device PDF viewer and inspect every page.
6. Confirm the landscape table shows all eight headings and that text wraps
   inside its own cell without clipping or overlapping.
7. Confirm the Next Scouting column includes a future date, an **Overdue** date,
   and **Next: Not scheduled**.
8. Open Android print preview and confirm all eight columns remain visible at
   the page edges.
9. Share the PDF to Files or email, then open the shared copy successfully.

## Eight-column check

The PDF must show: Date, Next Scouting, Block, Scouted By, Disease Pressure,
Pest / Notifiable, Action Taken, and Notes.