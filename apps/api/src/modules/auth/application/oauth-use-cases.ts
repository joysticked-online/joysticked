import type { Database } from '../../../shared/database';
import { createOAuthAccountRepository } from '../../../shared/database/repositories/oauth-account-repository';
import { createUserRepository } from '../../../shared/database/repositories/user-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import {
  consumeOAuthState,
  createOAuthState,
  generateCodeVerifier
} from '../../../shared/providers/oauth';
import { createSession } from '../../../shared/providers/session';
import { getOAuthProviderAdapter } from '../adapters/oauth';
import type { OAuthProvider, OAuthProviderAdapter } from './oauth-provider';

export async function startOAuthLoginUseCase(provider: OAuthProvider) {
  const adapter = getOAuthProviderAdapter(provider);
  const codeVerifier = generateCodeVerifier();
  const state = await createOAuthState({ provider, codeVerifier });
  return { state, url: adapter.createAuthorizationUrl(state, codeVerifier) };
}

export async function completeOAuthLoginUseCase(
  db: Database,
  {
    provider,
    code,
    state,
    adapter = getOAuthProviderAdapter(provider)
  }: {
    provider: OAuthProvider;
    code: string;
    state: string;
    adapter?: OAuthProviderAdapter;
  }
) {
  const stateData = await consumeOAuthState(state, provider);
  if (!stateData?.codeVerifier) return null;

  const identity = await adapter.exchangeCode(code, stateData.codeVerifier);
  if (identity.provider !== provider) throw new Error('OAuth provider mismatch');
  const users = createUserRepository(db);
  const accounts = createOAuthAccountRepository(db);

  return executeTransaction(db, async (tx) => {
    const existingAccount = await accounts.findByProvider(
      identity.provider,
      identity.providerId,
      tx
    );
    let user = existingAccount ? await users.findById(existingAccount.userId, tx) : null;
    if (existingAccount && !user) throw new Error('Linked user not found');

    if (!user && identity.email && identity.emailVerified) {
      user = await users.findByEmail(identity.email, tx);
    }

    if (!user) {
      user =
        identity.email && identity.emailVerified
          ? await users.createWithEmail(identity.email, tx)
          : await users.createWithoutEmail(tx);
    }

    if (identity.emailVerified && !user.emailVerified) await users.setEmailVerified(user.id, tx);
    await users.updateAuthProfile(
      user.id,
      {
        avatarUrl: identity.avatarUrl,
        displayName: identity.displayName
      },
      tx
    );

    if (!existingAccount) {
      await accounts.create(
        {
          provider: identity.provider,
          providerId: identity.providerId,
          userId: user.id
        },
        tx
      );
    }

    const sessionToken = await createSession(user.id);
    const currentUser = await users.findById(user.id, tx);
    if (!currentUser) throw new Error('Linked user not found');

    return {
      sessionToken,
      user: currentUser,
      hasUsername: !currentUser.username.startsWith('user_')
    };
  });
}
