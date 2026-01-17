## 2024-05-22 - Insecure GLTF/JSON Parsing and Path Sanitization
**Vulnerability:** Raw `JSON.parse` was used on user-uploaded GLTF files, and `split('/').pop()` was used for filename extraction. This posed risks of prototype pollution and weak path traversal protection.
**Learning:** Client-side 3D apps often treat model files as trusted, but GLTF is JSON and ZIPs contain paths. Ad-hoc validation is insufficient.
**Prevention:** Use `safeJsonParse` with a reviver to block `__proto__`. Use strict `sanitizeFilename` allowlists instead of just splitting paths. Centralize these in `src/lib/security.ts`.
