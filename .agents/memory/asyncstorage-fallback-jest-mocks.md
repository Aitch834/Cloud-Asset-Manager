---
name: AsyncStorage fallback Jest mocks
description: How to make mobile database fallback tests genuinely exercise AsyncStorage under the repository's Jest transform.
---

When testing the mobile database's AsyncStorage fallback, mock the package as an ES module whose `default` export contains wrapper functions that delegate to the in-memory fixture. Do not rely on returning a bare object or directly assigning a shared object as `default`.

**Why:** SQLite-path tests can pass while never touching AsyncStorage. Once SQLite initialization is intentionally failed, incompatible mock shapes leave the database module's default import undefined and obscure the behavior under test.

**How to apply:** Force `expo-sqlite` initialization to reject, add a direct database-API precondition before rendering the screen, and expose AsyncStorage methods through `default: { getItem: (...args) => fixture.getItem(...args), ... }`.