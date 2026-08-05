---
name: Subagent jobs go stale after session pause
description: Background subagent jobs die silently when the session pauses; waitForJob keeps reporting them as running.
---

Background subagent jobs do not survive a session pause/resume (e.g. user billing pause overnight). After resume, `waitForJob` keeps timing out as if the jobs were still running, but no work is happening.

**Why:** the durable runtime keeps the job records, but the underlying subagent processes were killed with the session.

**How to apply:** if `waitForJob` repeatedly times out after a session gap, don't keep waiting — check file mtimes (`ls -lt`) to see when edits actually stopped. If edits are older than the resume, cancel the stale jobs and dispatch fresh subagents covering only the remaining work (verify what's done via grep first).
