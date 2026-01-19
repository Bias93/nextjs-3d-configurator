/**
 * Security utilities for the application.
 * Centralized location for input validation, sanitization, and safe parsing.
 */

/**
 * Sanitizes a filename to prevent path traversal and remove unsafe characters.
 * strictly allows alphanumeric characters, spaces, dots, dashes, underscores, parentheses, and brackets.
 *
 * @param filename The filename to sanitize
 * @returns The sanitized filename with unsafe characters replaced by underscores
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory traversal sequences first
  const name = filename.replace(/^.*[\\\/]/, '');

  // Allow only safe characters: alphanumeric, spaces, ., -, _, (), []
  // Replace any other character with underscore
  return name.replace(/[^a-zA-Z0-9 .\-_()\[\]]/g, '_');
}

/**
 * Safely parses JSON to prevent prototype pollution.
 * Recursively checks keys to ensure no sensitive properties are present.
 *
 * @param text The JSON string to parse
 * @returns The parsed object
 * @throws Error if parsing fails or if unsafe keys are detected
 */
export function safeJsonParse<T = any>(text: string): T {
  const parsed = JSON.parse(text);

  const validate = (obj: any) => {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Check for prototype pollution keys
    // Note: iterating with for..in includes inherited properties, but JSON.parse returns plain objects usually.
    // However, if the JSON string itself contained these keys, they would be own properties.
    for (const key in obj) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new Error(`Unsafe JSON key detected: ${key}`);
      }
      validate(obj[key]);
    }
  };

  validate(parsed);
  return parsed as T;
}

/**
 * Validates file size.
 *
 * @param file The file to check
 * @param maxSize The maximum size in bytes
 * @returns True if valid, false otherwise
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validates mime type against a list of allowed types.
 *
 * @param file The file to check
 * @param allowedTypes The list of allowed mime types
 * @returns True if valid, false otherwise
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}
