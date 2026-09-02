---
name: Expo unit-test isolation
description: Keeping pure mobile logic testable without loading native Expo modules
---

Pure calculations used by Expo screens should be extracted into `lib` modules and tested there, rather than importing the screen into a unit test.

**Why:** The mobile unit Jest project can intentionally leave some native Expo dependencies untransformed; importing a screen may therefore fail before the pure logic is exercised.

**How to apply:** Keep native screen imports for component/integration tests with the required mocks. For deterministic business-rule tests, import the dependency-free helper and inject the current date when time affects the result.