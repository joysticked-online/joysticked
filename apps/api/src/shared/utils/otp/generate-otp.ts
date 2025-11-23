import { randomBytes } from 'node:crypto';

/**
 * Generates a cryptographically secure 6-digit One-Time Password (OTP) using Node.js crypto module.
 *
 * This function uses cryptographically secure random number generation instead of Math.random(),
 * making it suitable for production environments where security is critical.
 *
 * The OTP will always be exactly 6 digits long, ranging from 100000 to 999999.
 *
 * @returns {string} A 6-digit numeric OTP as a string (e.g., "123456", "987654")
 *
 * @example
 * ```typescript
 * const otp = generateOTP();
 * console.log(otp); // "542891" (example output)
 * console.log(otp.length); // 6
 * console.log(/^\d{6}$/.test(otp)); // true (validates 6 digits)
 * ```
 *
 * @security
 * - Uses Node.js crypto.randomBytes() for cryptographically secure randomness
 * - Suitable for authentication and security-sensitive applications
 * - Not predictable or reproducible unlike Math.random()
 *
 * @note randomBytes() is extremely reliable in normal Node.js environments.
 * If it fails, it will throw synchronously, which is appropriate for this use case.
 */
export function generateOTP(): string {
  const buffer = randomBytes(4);

  const randomValue = buffer.readUInt32BE(0);

  const min = 100000;
  const max = 999999;
  const range = max - min + 1;

  const otp = (randomValue % range) + min;

  return otp.toString();
}
