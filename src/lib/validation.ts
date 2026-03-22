/**
 * Shared input validation and sanitization utilities for API routes.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && EMAIL_REGEX.test(email) && email.length <= 254;
}

/**
 * Validate a phone number — allows digits, spaces, dashes, parens, optional leading plus.
 * Must contain between 7 and 15 digits (E.164 max is 15).
 */
const PHONE_REGEX = /^\+?[\d\s\-()]{7,25}$/;

export function isValidPhone(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  const digitCount = (phone.match(/\d/g) || []).length;
  return PHONE_REGEX.test(phone) && digitCount >= 7 && digitCount <= 15;
}

/**
 * Validate UUID v4 format.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

/**
 * Validate a date string in YYYY-MM-DD format.
 */
export function isValidDateString(date: string): boolean {
  if (typeof date !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + 'T00:00:00Z');
  return !isNaN(parsed.getTime());
}

/**
 * Sanitize a string for use in Supabase PostgREST filter operators.
 * Removes special PostgREST characters that could alter query behavior.
 */
export function sanitizeSearchInput(input: string): string {
  // Remove PostgREST operator characters, newlines, and limit length
  return input
    .replace(/[\\%_().,\n\r\t]/g, '')
    .trim()
    .slice(0, 100);
}

/**
 * Sanitize a plain text string — strip control characters, limit length.
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  // Remove all control characters (0x00-0x1F and 0x7F) except \n (0x0A) and \t (0x09)
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLength);
}

/**
 * Validate that a delivery method is one of the allowed values.
 */
export function isValidDeliveryMethod(method: string): method is 'building-delivery' | 'pickup' {
  return method === 'building-delivery' || method === 'pickup';
}

/**
 * Validate that a subscription frequency is one of the allowed values.
 */
export function isValidFrequency(freq: string): freq is 'weekly' | 'biweekly' {
  return freq === 'weekly' || freq === 'biweekly';
}

/**
 * Validate that a delivery day is one of the allowed values.
 */
export function isValidDeliveryDay(day: string): day is 'Tuesday' | 'Thursday' | 'Saturday' {
  return day === 'Tuesday' || day === 'Thursday' || day === 'Saturday';
}

/**
 * Validate a menu item ID (text slug format: lowercase alphanumeric + hyphens, 2-100 chars).
 */
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,98}[a-z0-9]$/;

export function isValidSlug(id: string): boolean {
  return typeof id === 'string' && SLUG_REGEX.test(id);
}

/**
 * Check that a URL path is safe for redirects (no open redirect).
 * Only allows relative paths starting with /.
 */
export function isSafeRedirectPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  // Must start with / but not // (which browsers interpret as protocol-relative URL)
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  // Block backslash variants that some browsers interpret as //
  if (path.startsWith('/\\')) return false;
  return true;
}
