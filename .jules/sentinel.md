# Sentinel Security Journal

## 2026-01-19 - Centralized Security Utilities
**Vulnerability:** Missing centralized security utilities led to inconsistent and potentially unsafe input handling. Specifically, `JSON.parse` was used on user-uploaded GLTF content without protection against prototype pollution, and filename sanitization was ad-hoc.
**Learning:** Client-side applications processing complex user inputs (ZIPs, JSONs) require robust, centralized validation logic to prevent subtle attacks like Zip Slip or Prototype Pollution. Ad-hoc validation is prone to errors and omission.
**Prevention:** Created `src/lib/security.ts` containing `safeJsonParse` (with recursive prototype pollution checks), `sanitizeFilename` (strict allowlist), `validateFileSize`, and `validateMimeType`. Refactored `ModelUploader` and `TextureUploader` to use these utilities, ensuring consistent security posture across the application.
