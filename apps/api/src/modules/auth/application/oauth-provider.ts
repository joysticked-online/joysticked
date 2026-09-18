export type OAuthProvider = 'google' | 'discord';

export type OAuthIdentity = {
  provider: OAuthProvider;
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
};

export type OAuthProviderAdapter = {
  provider: OAuthProvider;
  createAuthorizationUrl: (state: string, codeVerifier: string) => string;
  exchangeCode: (code: string, codeVerifier: string) => Promise<OAuthIdentity>;
};
