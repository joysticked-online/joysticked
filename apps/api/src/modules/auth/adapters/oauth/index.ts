import type { OAuthProvider, OAuthProviderAdapter } from '../../application/oauth-provider';
import { discordProvider } from './discord-provider';
import { googleProvider } from './google-provider';

export function getOAuthProviderAdapter(provider: OAuthProvider): OAuthProviderAdapter {
  switch (provider) {
    case 'google':
      return googleProvider;
    case 'discord':
      return discordProvider;
    default: {
      const exhaustive: never = provider;
      return exhaustive;
    }
  }
}
