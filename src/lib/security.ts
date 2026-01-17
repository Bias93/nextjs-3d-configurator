
/**
 * Security Utilities
 * Centralized functions for input validation, sanitization, and safe parsing.
 */

/**
 * Safely parses a JSON string, preventing prototype pollution.
 * Throws an error if forbidden keys (__proto__, constructor, prototype) are found.
 *
 * @param text - The JSON string to parse.
 * @returns The parsed object or null if parsing fails (and logs error).
 */
export function safeJsonParse<T = any>(text: string): T | null {
  try {
    return JSON.parse(text, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new Error(`Malicious JSON key detected: ${key}`);
      }
      return value;
    });
  } catch (error) {
    console.error('Safe JSON Parse Error:', error);
    return null;
  }
}

/**
 * Sanitizes a filename to prevent path traversal and remove unsafe characters.
 * Keeps alphanumeric characters, spaces, dots, dashes, underscores, and parentheses.
 *
 * @param filename - The filename to sanitize.
 * @returns The sanitized filename.
 */
export function sanitizeFilename(filename: string): string {
  // 1. Remove any directory path components (both / and \)
  //    This prevents path traversal like "../../etc/passwd"
  const name = filename.replace(/^.*[\\\/]/, '');

  // 2. Remove characters that are not in the allowlist
  //    Allow: a-z, A-Z, 0-9, space, ., -, _, (, ), [, ]
  return name.replace(/[^a-zA-Z0-9.\-_() \[\]]/g, '_');
}

/**
 * Validates that a file's size is within the allowed limit.
 *
 * @param file - The file to check.
 * @param maxBytes - The maximum allowed size in bytes.
 * @returns True if valid, false otherwise.
 */
export function validateFileSize(file: File, maxBytes: number): boolean {
  return file.size <= maxBytes;
}

/**
 * Validates that a file's MIME type is in the allowed list.
 *
 * @param file - The file to check.
 * @param allowedTypes - Array of allowed MIME types (e.g. ['image/png', 'application/json']).
 * @returns True if valid, false otherwise.
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}
