import type { Google } from 'arctic';
import { z } from 'zod';

import { getGoogleOAuthClient } from '../../../../shared/providers/oauth';
import { normalizeEmail } from '../../../../shared/utils/email-validation';
import type { OAuthProviderAdapter } from '../../application/oauth-provider';

const googleUserInfoSchema = z.object({
  sub: z.string().min(1),
  email: z.string().optional(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional()
});

export const googleProvider: OAuthProviderAdapter = {
  provider: 'google',
  createAuthorizationUrl: (state, codeVerifier) => {
    const client: Google = getGoogleOAuthClient();
    return client
      .createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email'])
      .toString();
  },
  exchangeCode: async (code, codeVerifier) => {
    const client = getGoogleOAuthClient();
    const tokens = await client.validateAuthorizationCode(code, codeVerifier);
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    });

    if (!response.ok) throw new Error('Failed to fetch Google user info');

    const user = googleUserInfoSchema.parse(await response.json());
    return {
      provider: 'google',
      providerId: user.sub,
      email: user.email ? normalizeEmail(user.email) : null,
      emailVerified: user.email_verified === true,
      displayName: user.name ?? null,
      avatarUrl: user.picture ?? null
    };
  }
};
