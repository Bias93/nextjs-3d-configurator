## 2026-01-14 - JSON Parsing and Filename Sanitization
**Vulnerability:** Untrusted GLTF JSON parsing could lead to prototype pollution, and ZIP extraction relied on simple splitting.
**Learning:** `JSON.parse` is unsafe for untrusted input. `src/lib/security.ts` is the centralized place for these validations.
**Prevention:** Use `safeJsonParse` and `sanitizeFilename` from `src/lib/security.ts`.
