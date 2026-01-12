/**
 * Security utilities for file handling and input validation.
 */

// File size limits
export const MAX_FILE_SIZE_10MB = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_150MB = 150 * 1024 * 1024;

/**
 * Sanitizes a filename to prevent path traversal and ensure safe characters.
 * Removes directory paths and non-alphanumeric characters (preserving dots/dashes/spaces/brackets).
 *
 * Allowed characters: a-z, A-Z, 0-9, ., -, _, space, (, ), [, ]
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory path components (prevent path traversal)
  const name = filename.split(/[/\\]/).pop() || filename;

  // Strict validation: Replace invalid characters with underscore
  return name.replace(/[^a-zA-Z0-9.\-_ ()\[\]]/g, '_');
}

/**
 * Validates file size against a limit.
 */
export function validateFileSize(file: File, maxBytes: number): boolean {
  return file.size <= maxBytes;
}

/**
 * Validates file MIME type against allowed types.
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Safely parses JSON preventing prototype pollution.
 * Performs a deep check for forbidden keys.
 */
export function safeJsonParse<T>(text: string): T {
  const obj = JSON.parse(text);

  const hasForbiddenKeys = (o: any): boolean => {
    if (!o || typeof o !== 'object') return false;

    // Check own keys
    if (Object.prototype.hasOwnProperty.call(o, '__proto__') ||
        Object.prototype.hasOwnProperty.call(o, 'constructor') ||
        Object.prototype.hasOwnProperty.call(o, 'prototype')) {
      return true;
    }

    // Recursively check values
    for (const key in o) {
      if (Object.prototype.hasOwnProperty.call(o, key)) {
         if (hasForbiddenKeys(o[key])) return true;
      }
    }

    return false;
  };

  if (hasForbiddenKeys(obj)) {
    throw new Error('Potential prototype pollution detected in JSON');
  }

  return obj as T;
}
