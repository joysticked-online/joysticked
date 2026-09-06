import { Discord, Google, generateCodeVerifier, generateState } from 'arctic';
import { envs } from '../config/envs';
import { InternalServerError } from '../errors/internal-server-error';
import { redis } from './redis';

const OAUTH_STATE_PREFIX = 'oauth:state:';
const OAUTH_STATE_TTL_SECONDS = 60 * 10; // 10 minutes

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
 * Stores OAuth state and optional PKCE code verifier in Redis with 10-minute TTL.
 */
export async function createOAuthState(data: OAuthStateData): Promise<string> {
  const state = generateState();
  await redis.set(
    `${OAUTH_STATE_PREFIX}${state}`,
    JSON.stringify(data),
    'EX',
    OAUTH_STATE_TTL_SECONDS
  );
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
  const raw = await redis.get(key);
  if (!raw) return null;

  await redis.del(key);

  try {
    const data = JSON.parse(raw) as OAuthStateData;
    if (data.provider !== expectedProvider) return null;
    return data;
  } catch {
    return null;
  }
}
