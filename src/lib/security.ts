
/**
 * Security utility functions for the application.
 */

/**
 * Validates if a filename contains only safe characters.
 * Allowed: alphanumeric, dots, dashes, underscores, spaces, parentheses, brackets.
 * Rejects: Control characters, slashes, backslashes, and other special characters.
 */
export function isSafeFilename(filename: string): boolean {
  // Check for empty or whitespace only
  if (!filename || !filename.trim()) return false;

  // Check for path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Allow alphanumeric, spaces, specific symbols (._-()[]).
  // We strictly allow ONLY space (ASCII 32), not other whitespace chars like tabs or newlines.
  const safePattern = /^[a-zA-Z0-9 ._\-()[\]]+$/;

  return safePattern.test(filename);
}

/**
 * Sanitizes a string for display, replacing unsafe characters with a substitute.
 */
export function sanitizeString(str: string, substitute: string = '_'): string {
  if (!str) return '';
  // Replace anything that is NOT in the safe set
  return str.replace(/[^a-zA-Z0-9 ._\-()[\]]/g, substitute);
}

/**
 * Safely parses JSON with error handling.
 */
export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    return null;
  }
}
