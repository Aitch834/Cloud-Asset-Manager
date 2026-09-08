# Mobile test typecheck

Run `pnpm --filter @workspace/mobile run typecheck:test` to typecheck mobile test
files and the library code they exercise.

`tsconfig.test.json` includes every `.ts` and `.tsx` file under `__tests__` by
default. Its explicit exclusions are the legacy tests whose Jest mocks do not
yet satisfy TypeScript's current DOM, React Native, or tuple typings. The
boundary is intentionally file-specific: do not add a directory glob, disable
strict checking, or use `skipLibCheck` to make a new test pass.

New tests must pass this command. When fixing an excluded test, remove its exact
entry from `tsconfig.test.json` in the same change so the boundary only shrinks.