import CryptoJS from "crypto-js";

// Get encryption key from environment variables
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "default-key-change-in-production";

// Only check encryption key in actual production deployment, not during build
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL &&
  ENCRYPTION_KEY === "default-key-change-in-production"
) {
  console.warn(
    "Warning: ENCRYPTION_KEY should be set in production environment"
  );
}

/**
 * Encrypt sensitive data
 */
export function encrypt(data: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Failed to decrypt data - invalid key or corrupted data");
    }

    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Hash sensitive data (one-way)
 */
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return CryptoJS.lib.WordArray.random(length).toString();
}

/**
 * Encrypt personal identifiable information
 */
export function encryptPII(data: {
  contactNumber?: string;
  businessName?: string;
  address?: string;
}): {
  contactNumber?: string;
  businessName?: string;
  address?: string;
} {
  const encrypted: any = {};

  if (data.contactNumber) {
    encrypted.contactNumber = encrypt(data.contactNumber);
  }

  if (data.businessName) {
    encrypted.businessName = encrypt(data.businessName);
  }

  if (data.address) {
    encrypted.address = encrypt(data.address);
  }

  return encrypted;
}

/**
 * Decrypt personal identifiable information
 */
export function decryptPII(encryptedData: {
  contactNumber?: string;
  businessName?: string;
  address?: string;
}): {
  contactNumber?: string;
  businessName?: string;
  address?: string;
} {
  const decrypted: any = {};

  if (encryptedData.contactNumber) {
    decrypted.contactNumber = decrypt(encryptedData.contactNumber);
  }

  if (encryptedData.businessName) {
    decrypted.businessName = decrypt(encryptedData.businessName);
  }

  if (encryptedData.address) {
    decrypted.address = decrypt(encryptedData.address);
  }

  return decrypted;
}

/**
 * Create secure password hash with salt
 */
export function createPasswordHash(password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });

  return salt.toString() + ":" + hash.toString();
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const saltWordArray = CryptoJS.enc.Hex.parse(salt);
  const computedHash = CryptoJS.PBKDF2(password, saltWordArray, {
    keySize: 256 / 32,
    iterations: 10000,
  });

  return computedHash.toString() === hash;
}
