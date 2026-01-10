## 2024-05-22 - Zip Bomb Prevention & Input Validation
**Vulnerability:** The client-side ZIP extractor processed all files in parallel using `Promise.all` and checked the total size only after chunks were extracted. This could allow a "zip bomb" (highly compressed archive) to exhaust browser memory before the size limit check triggered. Additionally, filenames were not strictly sanitized beyond simple path stripping.
**Learning:** `Promise.all` + `map` is dangerous for processing untrusted bulk data if resource limits need to be enforced incrementally. Sequential processing (`for ... await`) allows for "fail-fast" behavior. Client-side validation must assume the worst-case expansion ratio.
**Prevention:**
1. Use sequential processing for extraction loops to check limits incrementally.
2. Implement centralized `sanitizeFilename` that allows only specific safe characters (alphanumeric, dots, dashes, etc.).
3. Wrap JSON parsing with `safeJsonParse` to catch potential prototype pollution or invalid structure early.
