import { redis } from './redis';

const MAGIC_LINK_TTL_SECONDS = 60 * 15; // 15 minutes
const MAGIC_LINK_PREFIX = 'magic:';

/** Generates a cryptographically random 64-character hex token */
function generateMagicToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Stores a new magic link token for an email address in Redis.
 * Returns the token to be included in the email verification link.
 */
export async function createMagicLinkToken(email: string): Promise<string> {
  const token = generateMagicToken();
  await redis.set(`${MAGIC_LINK_PREFIX}${token}`, email, 'EX', MAGIC_LINK_TTL_SECONDS);
  return token;
}

/**
 * Verifies and consumes a magic link token (single-use guarantee).
 * Returns the associated email if valid, null if invalid or expired.
 */
export async function consumeMagicLinkToken(token: string): Promise<string | null> {
  const key = `${MAGIC_LINK_PREFIX}${token}`;
  const email = await redis.get(key);
  if (!email) {
    return null;
  }
  await redis.del(key);
  return email;
}
