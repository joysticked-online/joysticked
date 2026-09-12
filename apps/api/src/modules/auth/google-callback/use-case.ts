import { eq } from 'drizzle-orm';
import type { Database } from '../../../shared/database';
import { createOAuthAccountRepository } from '../../../shared/database/repositories/oauth-account-repository';
import { createUserRepository } from '../../../shared/database/repositories/user-repository';
import { users } from '../../../shared/database/schemas/users';
import { executeTransaction } from '../../../shared/database/transaction';
import { consumeOAuthState, getGoogleOAuthClient } from '../../../shared/providers/oauth';
import { createSession } from '../../../shared/providers/session';

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function googleOAuthCallbackUseCase(
  db: Database,
  { code, state }: { code: string; state: string }
) {
  const stateData = await consumeOAuthState(state, 'google');
  if (!stateData?.codeVerifier) {
    return null;
  }

  const google = getGoogleOAuthClient();
  const tokens = await google.validateAuthorizationCode(code, stateData.codeVerifier);
  const accessToken = tokens.accessToken();

  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  const googleUser = (await response.json()) as GoogleUserInfo;
  const providerId = googleUser.sub;
  const email = googleUser.email?.toLowerCase();
  const emailVerified = Boolean(googleUser.email_verified);
  const avatarUrl = googleUser.picture || null;
  const displayName = googleUser.name || null;

  const oauthAccountRepository = createOAuthAccountRepository(db);
  const userRepository = createUserRepository(db);

  return executeTransaction(db, async (tx) => {
    const existingAccount = await oauthAccountRepository.findByProvider('google', providerId);

    let userId: string;
    let user: Awaited<ReturnType<typeof userRepository.findById>>;

    if (existingAccount) {
      userId = existingAccount.userId;
      user = await userRepository.findById(userId);
      if (!user) throw new Error('Linked user not found');

      if (!user.avatarUrl && avatarUrl) {
        await (tx ?? db).update(users).set({ avatarUrl }).where(eq(users.id, userId));
      }
    } else {
      const existingUserByEmail =
        email && emailVerified ? await userRepository.findByEmail(email) : null;

      if (existingUserByEmail) {
        user = existingUserByEmail;
        userId = existingUserByEmail.id;
        if (emailVerified && !user.emailVerified) {
          await userRepository.setEmailVerified(userId, tx);
        }
        if (!user.avatarUrl && avatarUrl) {
          await (tx ?? db).update(users).set({ avatarUrl }).where(eq(users.id, userId));
        }
      } else {
        if (email && emailVerified) {
          user = await userRepository.createWithEmail(email, tx);
          if (emailVerified) {
            await userRepository.setEmailVerified(user.id, tx);
          }
        } else {
          user = await userRepository.createWithoutEmail(tx);
        }
        userId = user.id;

        if (avatarUrl || displayName) {
          await (tx ?? db)
            .update(users)
            .set({
              avatarUrl: avatarUrl || undefined,
              displayName: displayName || undefined
            })
            .where(eq(users.id, userId));
        }
      }

      await oauthAccountRepository.create(
        {
          provider: 'google',
          providerId,
          userId
        },
        tx
      );
    }

    const sessionToken = await createSession(userId);

    return {
      sessionToken,
      user,
      hasUsername: Boolean(user?.username && !user.username.startsWith('user_'))
    };
  });
}
