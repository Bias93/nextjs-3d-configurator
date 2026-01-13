
/**
 * Security utilities for file handling, validation, and parsing.
 * Centralizes security checks to ensure consistency across the application.
 */

// Deny list for prototype pollution
const PROTO_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Safely parses JSON string, protecting against prototype pollution.
 * Recursively checks keys to ensure no sensitive object properties are modified.
 *
 * @param text - The JSON string to parse
 * @returns The parsed object
 * @throws SyntaxError if JSON is invalid
 * @throws Error if potential security risk is detected
 */
export function safeJsonParse<T = any>(text: string): T {
  const obj = JSON.parse(text);

  // Recursive scan for forbidden keys
  function scan(value: any) {
    if (!value || typeof value !== 'object') return;

    for (const key in value) {
      if (PROTO_KEYS.includes(key)) {
        throw new Error(`Potential prototype pollution detected: key "${key}" is forbidden.`);
      }
      // Check for hasOwnProperty to prevent bypassing prototype check if the object itself is malicious
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        scan(value[key]);
      }
    }
  }

  scan(obj);
  return obj;
}

/**
 * Sanitizes a filename to prevent path traversal and ensure safe characters.
 * Removes directory components and non-alphanumeric characters (except . - _ ( ) [ ]).
 *
 * @param filename - The original filename
 * @returns The sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // 1. Remove directory traversal sequences and slashes
  // We use the last component of the path
  const name = filename.split(/[/\\]/).pop() || '';

  // 2. Allow only alphanumeric, spaces, dots, dashes, underscores, parens, and brackets
  // This matches the "Filename validation strictly allows..." memory item
  // but we should be careful not to be too restrictive if users have valid names.
  // However, "strictly allows" implies a whitelist.
  // Regex: [a-zA-Z0-9 .-_()[\]]
  // We replace anything NOT in this set with empty string or underscore?
  // Usually better to replace with underscore or remove.
  // Let's remove invalid characters.

  const cleanName = name.replace(/[^a-zA-Z0-9 ._\-()[\]]/g, '_');

  // 3. Ensure it's not empty and not just dots (e.g. "..")
  if (!cleanName || /^\.+$/.test(cleanName)) {
    return 'unnamed_file';
  }

  return cleanName;
}

/**
 * Validates that a file's size is within the allowed limit.
 *
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if valid, false otherwise
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size >= 0 && size <= maxSize;
}

/**
 * Validates that a file's MIME type is in the allowed list.
 *
 * @param type - The file's MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if valid, false otherwise
 */
export function validateMimeType(type: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(type);
}
