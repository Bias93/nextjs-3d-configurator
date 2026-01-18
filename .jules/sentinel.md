## 2025-02-12 - Insecure GLTF/JSON Parsing
**Vulnerability:** Raw `JSON.parse` was used on uploaded GLTF files, which are user-controlled JSON. This could allow prototype pollution if the parsed object is mishandled.
**Learning:** Even client-side file parsing requires robust input sanitization. `JSON.parse` does not protect against `__proto__` by default.
**Prevention:** Always use a reviver function with `JSON.parse` or a utility like `safeJsonParse` when processing untrusted JSON content to block forbidden keys.
