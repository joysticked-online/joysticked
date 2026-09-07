import { Discord, Google, generateCodeVerifier, generateState } from 'arctic';
import { envs } from '../config/envs';
import { InternalServerError } from '../errors/internal-server-error';
import { redis } from './redis';

const OAUTH_STATE_PREFIX = 'oauth:state:';
const OAUTH_STATE_TTL_SECONDS = 60 * 10; // 10 minutes

// In-memory fallback if Redis is down
const inMemoryStates = new Map<string, { data: OAuthStateData; expiresAt: number }>();

export function getGoogleOAuthClient(): Google {
  if (!envs.auth.GOOGLE_CLIENT_ID || !envs.auth.GOOGLE_CLIENT_SECRET) {
    throw new InternalServerError('Google OAuth is not configured on the server');
  }

  const redirectURI = `${envs.auth.AUTH_CALLBACK_URL}/auth/google/callback`;
  return new Google(envs.auth.GOOGLE_CLIENT_ID, envs.auth.GOOGLE_CLIENT_SECRET, redirectURI);
}

export function getDiscordOAuthClient(): Discord {
  if (!envs.auth.DISCORD_CLIENT_ID || !envs.auth.DISCORD_CLIENT_SECRET) {
    throw new InternalServerError('Discord OAuth is not configured on the server');
  }

  const redirectURI = `${envs.auth.AUTH_CALLBACK_URL}/auth/discord/callback`;
  return new Discord(envs.auth.DISCORD_CLIENT_ID, envs.auth.DISCORD_CLIENT_SECRET, redirectURI);
}

export { generateState, generateCodeVerifier };

export type OAuthStateData = {
  provider: 'google' | 'discord';
  codeVerifier?: string;
};

/**
 * Stores OAuth state and optional PKCE code verifier in Redis (with in-memory fallback) with 10-minute TTL.
 */
export async function createOAuthState(data: OAuthStateData): Promise<string> {
  const state = generateState();
  try {
    await redis.set(
      `${OAUTH_STATE_PREFIX}${state}`,
      JSON.stringify(data),
      'EX',
      OAUTH_STATE_TTL_SECONDS
    );
  } catch (_err) {
    console.warn('[OAuth] Redis unavailable, using in-memory state fallback');
  }
  inMemoryStates.set(state, { data, expiresAt: Date.now() + OAUTH_STATE_TTL_SECONDS * 1000 });
  return state;
}

/**
 * Validates and single-use consumes the OAuth state parameter.
 * Returns the state metadata or null if invalid/expired/provider mismatch.
 */
export async function consumeOAuthState(
  state: string,
  expectedProvider: 'google' | 'discord'
): Promise<OAuthStateData | null> {
  const key = `${OAUTH_STATE_PREFIX}${state}`;
  let raw: string | null = null;
  try {
    raw = await redis.get(key);
    if (raw) {
      await redis.del(key);
    }
  } catch {
    // Redis unavailable
  }

  if (raw) {
    try {
      const data = JSON.parse(raw) as OAuthStateData;
      if (data.provider !== expectedProvider) return null;
      return data;
    } catch {
      return null;
    }
  }

  // Check in-memory fallback
  const mem = inMemoryStates.get(state);
  if (mem) {
    inMemoryStates.delete(state);
    if (Date.now() > mem.expiresAt) return null;
    if (mem.data.provider !== expectedProvider) return null;
    return mem.data;
  }

  return null;
}
