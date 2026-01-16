
/**
 * Security utilities for the application.
 */

/**
 * Safely parses a JSON string, preventing prototype pollution.
 * Removes keys like __proto__, constructor, and prototype.
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

/**
 * Sanitizes a filename to prevent path traversal and remove unsafe characters.
 * Allows: Alphanumeric, spaces, dots, dashes, underscores, parentheses, brackets.
 * Replaces directory traversal sequences and limits length.
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal sequences (get basename)
  const name = filename.replace(/^.*[\\\/]/, '');

  // Allow only safe characters
  // alphanumeric, spaces, dots, dashes, underscores, parentheses, brackets
  const safeName = name.replace(/[^a-zA-Z0-9\s._()[\]-]/g, '');

  // Ensure not empty and limited length (e.g. 255)
  return safeName.slice(0, 255) || 'unnamed_file';
}

/**
 * Validates file size.
 * @returns true if valid, false if exceeds limit
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validates file MIME type.
 * @returns true if valid, false if not allowed
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}
