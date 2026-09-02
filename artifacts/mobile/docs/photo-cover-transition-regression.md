# Mobile photo cover transition regression

## Purpose

Confirm that promoting a second photo immediately moves the `★` cover badge
from the old photo to the new one, without requiring a reload and without ever
showing two cover badges.

## Device or emulator check

Use a signed-in mobile session and a farm record that already has at least two
photos. If necessary, upload two photos first. Make photo A the cover before
starting each flow so the test begins with one visible `★`.

Repeat the following steps for each screen:

1. Open a scouting record's photo section, a new spray diary record's photo
   section, or a spray diary history record's photo section.
2. Confirm photo A has one `★` badge and photo B has none.
3. Long-press photo B and tap **Set as cover**.
4. Immediately, before refreshing or leaving the screen, verify that photo A
   no longer has a `★` and photo B now has the only `★`.
5. Confirm no duplicate `★` badges appear while the save is in progress or
   after the success feedback.
6. Leave the screen and return once to confirm the server-backed result still
   shows photo B as the only cover.

Run the flow on:

- **Scouting record** — `ScoutingPhotoSection`
- **New spray diary record** — `vine-spray-diary.tsx`
- **Spray diary history record** — `vine-spray-diary-history.tsx`

## Automated source guard

`__tests__/photo-cover-transition.test.ts` checks all three handlers for the
same successful-response state transition: every photo is first treated as
non-cover and only the promoted photo is marked as the cover. It also checks
that each screen renders the star from the current `isCover` value.
