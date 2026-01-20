export const MAX_FILE_SIZE_10MB = 10 * 1024 * 1024;
export const MAX_FILE_SIZE_150MB = 150 * 1024 * 1024;

/**
 * Sanitizes a filename to prevent path traversal and remove unsafe characters.
 * Allows: alphanumeric, spaces, dots, dashes, underscores, parentheses, and brackets.
 */
export function sanitizeFilename(filename: string): string {
  // 1. Remove any directory path components (both forward and back slashes)
  const name = filename.replace(/^.*[\\\/]/, '');

  // 2. Replace characters that are not in the allowed set with underscore
  // Allowed: a-z, A-Z, 0-9, space, ., -, _, (, ), [, ]
  return name.replace(/[^a-zA-Z0-9.\-_\(\)\[\] ]/g, '_');
}

/**
 * Validates that a file's size is within the specified limit.
 */
export function validateFileSize(file: File | Blob, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validates that a file's MIME type is in the allowed list.
 */
export function validateMimeType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Safely parses a JSON string, ensuring it doesn't contain potential prototype pollution vectors.
 * Checks for keys: '__proto__', 'constructor', 'prototype'
 */
export function safeJsonParse<T>(text: string): T | null {
  try {
    const obj = JSON.parse(text);

    // Recursive check for dangerous keys
    const containsDangerousKeys = (value: any): boolean => {
      if (!value || typeof value !== 'object') {
        return false;
      }

      // Check keys to detect forbidden properties
      // We iterate to ensure we catch keys that might be malicious payload
      for (const key in value) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return true;
        }

        if (containsDangerousKeys(value[key])) {
          return true;
        }
      }

      return false;
    };

    if (containsDangerousKeys(obj)) {
      console.error('JSON contains forbidden keys (potential prototype pollution)');
      return null;
    }

    return obj as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}
