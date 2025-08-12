import DOMPurify from "isomorphic-dompurify";
import validator from "validator";

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text input
 */
export function sanitizeText(input: string): string {
  return validator.escape(input.trim());
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (!validator.isEmail(trimmed)) {
    throw new Error("Invalid email format");
  }
  return validator.normalizeEmail(trimmed) || trimmed;
}

/**
 * Sanitize phone numbers (South African format)
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Validate South African phone number format
  if (!validator.isMobilePhone(cleaned, "en-ZA")) {
    throw new Error("Invalid South African phone number format");
  }

  return cleaned;
}

/**
 * Sanitize URL inputs
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!validator.isURL(trimmed, { protocols: ["http", "https"] })) {
    throw new Error("Invalid URL format");
  }
  return trimmed;
}

/**
 * Sanitize file names to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and dangerous characters
  return fileName
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/\.\./g, "")
    .trim();
}

/**
 * Validate and sanitize numeric inputs
 */
export function sanitizeNumber(
  input: string | number,
  min?: number,
  max?: number
): number {
  const num = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(num)) {
    throw new Error("Invalid number format");
  }

  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }

  return num;
}

/**
 * Sanitize postal code (South African format)
 */
export function sanitizePostalCode(postalCode: string): string {
  const cleaned = postalCode.replace(/\s/g, "");

  // South African postal codes are 4 digits
  if (!/^\d{4}$/.test(cleaned)) {
    throw new Error("Invalid South African postal code format");
  }

  return cleaned;
}
