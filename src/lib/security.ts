/**
 * Security utilities for input validation and sanitization.
 */

// Allow alphanumeric, dots, dashes, underscores, parentheses, brackets, and spaces.
// This matches the strict filename validation requirements.
const SAFE_FILENAME_REGEX = /[^a-zA-Z0-9\s.\-_()\[\]]/g;

/**
 * Sanitizes a filename by removing unsafe characters.
 * Prevents path traversal and shell injection risks in filenames.
 *
 * @param filename The original filename
 * @returns A sanitized filename safe for use
 */
export function sanitizeFilename(filename: string): string {
  // 1. Remove path components (strictly just the basename)
  // This handles both forward and backward slashes to prevent directory traversal
  const basename = filename.split(/[/\\]/).pop() || filename;

  // 2. Replace unsafe characters with underscore
  // This prevents control characters or special shell characters
  return basename.replace(SAFE_FILENAME_REGEX, '_');
}

/**
 * Validates file size against a limit.
 *
 * @param size File size in bytes
 * @param maxBytes Maximum allowed size in bytes
 * @returns true if valid, false otherwise
 */
export function validateFileSize(size: number, maxBytes: number): boolean {
  return size >= 0 && size <= maxBytes;
}

/**
 * Validates MIME type against allowed list.
 *
 * @param type The MIME type to check
 * @param allowedTypes Array of allowed MIME types
 * @returns true if valid, false otherwise
 */
export function validateMimeType(type: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(type);
}

/**
 * Safely parses JSON with basic protection against prototype pollution.
 *
 * @param text The JSON string to parse
 * @returns The parsed object
 * @throws Error if JSON is invalid or unsafe
 */
export function safeJsonParse<T = any>(text: string): T {
  try {
    const result = JSON.parse(text);

    // Basic prototype pollution prevention
    // While JSON.parse shouldn't execute code, properties like __proto__
    // can be problematic if the object is later merged unsafely.
    if (result && typeof result === 'object' && !Array.isArray(result)) {
       if ('__proto__' in result || 'constructor' in result) {
         throw new Error('Unsafe JSON content detected: prototype pollution risk');
       }
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unsafe JSON')) {
      throw error;
    }
    throw new Error('Invalid JSON content');
  }
}
