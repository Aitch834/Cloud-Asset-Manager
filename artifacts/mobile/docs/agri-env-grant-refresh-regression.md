# Agri-environment grant refresh regression

This is the real-device check for a milestone changed in the dashboard while
the mobile project list is holding cached data.

## Test fixture

Use an authenticated farm that has:

- one active, applied, or pending agri-environment project;
- a total grant value of **£1,000**; and
- one milestone with a claim amount of **£250**, initially not paid.

The project should have no other paid milestones. If the farm already has
different values, record the expected percentage as:

`paid milestone total ÷ project grant value × 100`

Choose values that produce a clear, non-rounded change where possible.

## Real-device flow

1. On the phone, open **Agri-environment projects** and wait for the project
   list to finish loading. Expand the fixture project and verify its cached
   baseline is visible: the milestone is not **Paid** and the project shows
   **0% drawn** (or the equivalent pre-change percentage).
2. Without force-quitting the mobile app, switch to the dashboard in a
   separate browser session for the same farm. Open **Grants & Funding**,
   expand the fixture project, and edit the fixture milestone:
   - set its status to **Paid**;
   - set a valid completion date (today or an earlier date); and
   - leave the claim amount at **£250**.
   
   Save the milestone and wait for the dashboard’s **Milestone updated**
   confirmation.
3. Switch back to the mobile app. From the cached project list, open the
   changed milestone by tapping its name/details row (not the status pill).
   Do not pull to refresh.
4. On **Milestone Detail**, wait for the background refresh to finish. Pass
   this step when the detail shows **Paid**, the updated completion date, and
   **£250** as the claim amount, even if the first frame briefly shows the
   cached pre-change state.
5. Tap the back arrow to return to the agri-environment project list. Do not
   pull to refresh or force-quit the app. Pass the final step when the
   project’s progress updates to **25% drawn** and **£250 of £1,000 claimed**
   (and the farm-wide drawdown summary, when shown, reflects the same current
   total).

## Pass criteria

- The mobile detail screen changes to the dashboard’s saved milestone values
  without a manual refresh.
- Returning with normal back navigation reloads the project list and shows the
  current drawdown percentage.
- The old cached percentage is not left visible until the user performs a
  full refresh.

Record the device model, OS version, app build, farm/project fixture, and
before/after percentages with the release check. A failure is specifically
reproducible if either screen remains on the cached status or percentage until
pull-to-refresh.

## Automated guards

Run the mobile unit checks alongside the device flow:

```sh
pnpm --filter @workspace/mobile test -- \
  __tests__/agri-env-cache-cleanup.test.ts \
  __tests__/agri-env-milestone-cache-race.test.ts \
  --runInBand
```

These checks cover cleanup of stale agri-environment cache entries and
protection against an older detail request overwriting confirmed milestone
data. The phone flow above covers the navigation/focus behavior that cannot
be proven by those unit tests.