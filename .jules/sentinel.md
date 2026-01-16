## 2024-05-22 - Missing Centralized Security Utilities
**Vulnerability:** Core security utilities (`safeJsonParse`, `sanitizeFilename`) were referenced in documentation/memory but completely missing from the codebase, leading to potential prototype pollution and weak filename sanitization in `ModelUploader`.
**Learning:** Documentation/Memory can drift from reality. The assumption that "standard" security utils exist must always be verified.
**Prevention:** Always verify the existence and implementation of security helpers before relying on them. Implement "defense in depth" by checking these during CI or architectural reviews.
