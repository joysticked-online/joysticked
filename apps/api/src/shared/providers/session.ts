import { redis } from './redis';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_PREFIX = 'session:';

// In-memory fallback if Redis is down
const inMemorySessions = new Map<string, { userId: string; expiresAt: number }>();

/** Generates a cryptographically random 64-character hex token */
function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Creates a new session for the given userId in Redis.
 * Returns the session token that should be stored in the browser cookie.
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  try {
    await redis.set(`${SESSION_PREFIX}${token}`, userId, 'EX', SESSION_TTL_SECONDS);
  } catch {
    console.warn('[Session] Redis unavailable, using in-memory session fallback');
  }
  inMemorySessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
  });
  return token;
}

/**
 * Looks up a session token in Redis.
 * Returns the userId if the session exists and is valid, null otherwise.
 */
export async function getSession(token: string): Promise<string | null> {
  try {
    const userId = await redis.get(`${SESSION_PREFIX}${token}`);
    if (userId) return userId;
  } catch {
    // Redis offline
  }

  const mem = inMemorySessions.get(token);
  if (mem) {
    if (Date.now() > mem.expiresAt) {
      inMemorySessions.delete(token);
      return null;
    }
    return mem.userId;
  }

  return null;
}

/**
 * Deletes a session from Redis — used on logout.
 */
export async function deleteSession(token: string): Promise<void> {
  try {
    await redis.del(`${SESSION_PREFIX}${token}`);
  } catch {
    // Redis offline
  }
  inMemorySessions.delete(token);
}
