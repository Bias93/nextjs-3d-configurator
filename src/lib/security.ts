
/**
 * Security utilities for file handling and input validation.
 */

/**
 * Sanitizes a filename by removing path components and unsafe characters.
 * Allows alphanumeric, dots, dashes, underscores, spaces, brackets, and parentheses.
 * Replaces other characters with underscore.
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components (everything before the last / or \)
  const name = filename.replace(/^.*[\\\/]/, '');

  // Allow alphanumeric, dots, dashes, underscores, spaces, brackets, parentheses
  // Replaces unsafe characters with _
  return name.replace(/[^a-zA-Z0-9\.\-_ \(\)\[\]]/g, '_');
}

/**
 * Validates that a file's size is within the specified limit.
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validates that a file's MIME type is in the allowed list.
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Safely parses a JSON string.
 * Returns null if parsing fails.
 */
export function safeJsonParse<T = any>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
