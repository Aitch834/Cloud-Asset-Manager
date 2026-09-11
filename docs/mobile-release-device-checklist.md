# Mobile physical-device release checklist

Physical-device-only checks are release activities, not autonomous development
tasks. They must not be assigned to an agent merely to wait for somebody to use
a phone.

## Intake and routing rule

Before assigning mobile work, separate anything that requires a person to use a
physical iPhone or Android phone:

1. Put the implementation and automated verification in an autonomous task.
2. Put the physical-device step in this checklist and label it
   **MANUAL — PHYSICAL DEVICE**.
3. The implementation task may link to the checklist item, but the device result
   is not a condition for the agent to release its concurrency slot.
4. A release owner performs the check when the required build, phone, account,
   and native app are available.
5. Record the result in the release record using the template below. A failure
   should create a new development task with the observed behaviour and evidence;
   do not reassign the checklist itself to an autonomous agent.

A check is physical-device-only when its result depends on real device hardware,
an installed native app, operating-system UI, permissions, background behaviour,
or a release build in a way that Expo Go, web preview, a simulator, or an
automated test cannot establish.

## Checks

All items in this section are **MANUAL — PHYSICAL DEVICE** and remain unassigned
until a release owner performs them.

| Release check | Device coverage | Procedure |
| --- | --- | --- |
| Vine Register email handoff | iPhone and Android | [Procedure](../artifacts/mobile/docs/vine-register-email-device-check.md) |
| Vine Operations History PDF share | Physical phone(s) specified by procedure | [Procedure](../artifacts/mobile/docs/vine-operations-pdf-device-check.md) |
| Vine Scouting History PDF share | Physical phone(s) specified by procedure | [Procedure](../artifacts/mobile/docs/vine-scouting-pdf-device-check.md) |
| Organic Input Register PDF share | Physical phone(s) specified by procedure | [Procedure](../artifacts/mobile/docs/organic-input-register-pdf-device-check.md) |
| Scouting-photo caption save failure | Physical phone(s) specified by procedure | [Procedure](../artifacts/mobile/docs/scouting-photo-caption-failure-device-check.md) |
| Harvest vintage restoration | Physical phone | [Procedure](../artifacts/mobile/docs/harvest-vintage-restoration-regression.md) |
| Agri-environment grant refresh | Physical phone | [Procedure](../artifacts/mobile/docs/agri-env-grant-refresh-regression.md) |
| Agri-environment milestone date picker | Physical phone | [Procedure](../artifacts/mobile/docs/agri-env-milestone-date-picker-regression.md) |
| Photo cover transition | Physical phone | [Procedure](../artifacts/mobile/docs/photo-cover-transition-regression.md) |

Run each procedure's automated guards before the manual check. Automated guards
belong in development or release automation and do not change the manual status
of the remaining physical-device step.

## Release result record

Copy one record per performed check into the release notes or release ticket.
This checklist is the stable source for the procedure; release-specific results
should not be committed here.

```md
### <release check name>

- Label: MANUAL — PHYSICAL DEVICE
- Release/build:
- Date (UTC):
- Tester:
- Device model:
- OS and version:
- Test account or fixture:
- Result: PASS | FAIL | BLOCKED | NOT RUN
- Evidence link:
- Notes:
```

`NOT RUN` and `BLOCKED` are recorded release decisions, not reasons to leave an
autonomous agent assigned. The release owner decides whether the release can
proceed.