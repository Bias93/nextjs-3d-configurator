## 2025-01-13 - Prototype Pollution in Client-Side JSON Parsing
**Vulnerability:** Use of `JSON.parse()` on untrusted GLTF content without validation.
**Learning:** Even client-side JSON parsing can be dangerous if the parsed object is used in property assignment or merged into existing objects, potentially leading to prototype pollution.
**Prevention:** Use a recursive `safeJsonParse` that explicitly forbids `__proto__`, `constructor`, and `prototype` keys before the object is used.

## 2025-01-13 - Path Traversal in ZIP Extraction
**Vulnerability:** Extracting files from a ZIP archive using filenames directly from the archive structure.
**Learning:** ZIP archives can contain relative paths (`../`) which could theoretically write outside the intended directory or confuse application logic if not sanitized.
**Prevention:** Always sanitize filenames extracted from archives using a strict allowlist (alphanumeric + safe symbols) and removing directory components.
