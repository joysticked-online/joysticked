import type { Discord } from 'arctic';
import { z } from 'zod';

import { getDiscordOAuthClient } from '../../../../shared/providers/oauth';
import { normalizeEmail } from '../../../../shared/utils/email-validation';
import type { OAuthProviderAdapter } from '../../application/oauth-provider';

const discordUserInfoSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  global_name: z.string().nullable().optional(),
  email: z.string().optional(),
  verified: z.boolean().optional(),
  avatar: z.string().nullable().optional()
});

export const discordProvider: OAuthProviderAdapter = {
  provider: 'discord',
  createAuthorizationUrl: (state, codeVerifier) => {
    const client: Discord = getDiscordOAuthClient();
    return client.createAuthorizationURL(state, codeVerifier, ['identify', 'email']).toString();
  },
  exchangeCode: async (code, codeVerifier) => {
    const client = getDiscordOAuthClient();
    const tokens = await client.validateAuthorizationCode(code, codeVerifier);
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    });

    if (!response.ok) throw new Error('Failed to fetch Discord user info');

    const user = discordUserInfoSchema.parse(await response.json());
    return {
      provider: 'discord',
      providerId: user.id,
      email: user.email ? normalizeEmail(user.email) : null,
      emailVerified: user.verified === true,
      displayName: user.global_name ?? user.username,
      avatarUrl: user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
        : null
    };
  }
};
