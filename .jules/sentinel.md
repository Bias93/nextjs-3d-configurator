# Sentinel Journal

## 2024-05-24 - Missing Security Utilities
**Vulnerability:** Centralized security utilities (`src/lib/security.ts`) referenced in memory are missing.
**Learning:** Documentation/Memory can drift from code reality. Security logic duplication leads to inconsistencies (e.g., `ModelUploader` has custom validation that `TextureUploader` doesn't share, though `TextureUploader` has its own).
**Prevention:** Implement `src/lib/security.ts` and refactor components to use it.
