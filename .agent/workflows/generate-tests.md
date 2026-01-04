---
description: Generate unit tests for an existing file
---

1. Ask the user for the relative path of the file to test

2. Read the content of the target file to understand its logic

3. Create a new test file:
   - Same directory with `.test.ts` or `.spec.ts` extension
   - Or in `__tests__/` directory

4. Write comprehensive tests:
   - At least 3 tests per exported function
   - Cover happy path, edge cases, and error cases
   - Use clear, descriptive test names

5. // turbo
   Run `npm test -- --watch=false` to verify tests pass