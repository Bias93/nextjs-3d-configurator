
/**
 * Security utility functions for input validation and sanitization.
 */

/**
 * Sanitizes a filename to prevent path traversal and ensure safe characters.
 * Removes directory paths and restricts to alphanumeric and safe symbols.
 *
 * @param filename The original filename or path
 * @returns The sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove directory paths (flatten) to prevent path traversal
  const name = filename.split(/[/\\]/).pop() || filename;

  // Allow alphanumeric, spaces, dots, dashes, underscores, parentheses, brackets
  // Removes potentially dangerous characters like quotes, colons, slashes, etc.
  return name.replace(/[^a-zA-Z0-9 .\-_()\[\]]/g, '');
}

/**
 * Validates that a file's size is within the specified limit.
 *
 * @param file The file to check
 * @param maxSize The maximum allowed size in bytes
 * @returns true if valid, false otherwise
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validates that a file's MIME type is in the allowed list.
 *
 * @param file The file to check
 * @param allowedTypes Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Safely parses a JSON string, preventing prototype pollution.
 * Returns null if parsing fails.
 *
 * @param text The JSON string to parse
 * @returns The parsed object or null if failed
 */
export function safeJsonParse<T = any>(text: string): T | null {
  try {
    return JSON.parse(text, (key, value) => {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
  } catch (error) {
    // Log error but don't expose stack trace or details to UI
    console.error('SafeJSONParse: Failed to parse JSON');
    return null;
  }
}
