# Sentinel Journal

## 2025-01-08 - Uncontrolled Memory Consumption in ZIP Upload
**Vulnerability:** The `ModelUploader` component extracts all files from a ZIP archive in parallel using `Promise.all` before checking the total size limit.
**Learning:** `Promise.all` combined with resource-intensive operations (like decompression) can lead to rapid resource exhaustion because all operations start simultaneously. A "check-after-work" pattern is dangerous when the work itself consumes significant resources.
**Prevention:** Use sequential processing for resource-intensive bulk operations. Check limits incrementally.
