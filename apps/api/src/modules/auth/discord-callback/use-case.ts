import { eq } from 'drizzle-orm';
import type { Database } from '../../../shared/database';
import { createOAuthAccountRepository } from '../../../shared/database/repositories/oauth-account-repository';
import { createUserRepository } from '../../../shared/database/repositories/user-repository';
import { users } from '../../../shared/database/schemas/users';
import { executeTransaction } from '../../../shared/database/transaction';
import { consumeOAuthState, getDiscordOAuthClient } from '../../../shared/providers/oauth';
import { createSession } from '../../../shared/providers/session';

type DiscordUserInfo = {
  id: string;
  username: string;
  email?: string;
  verified?: boolean;
  avatar?: string;
};

export async function discordOAuthCallbackUseCase(
  db: Database,
  { code, state }: { code: string; state: string }
) {
  const stateData = await consumeOAuthState(state, 'discord');
  if (!stateData || !stateData.codeVerifier) {
    return null;
  }

  const discord = getDiscordOAuthClient();
  const tokens = await discord.validateAuthorizationCode(code, stateData.codeVerifier);
  const accessToken = tokens.accessToken();

  const response = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user info');
  }

  const discordUser = (await response.json()) as DiscordUserInfo;
  const providerId = discordUser.id;
  const email = discordUser.email?.toLowerCase();
  const emailVerified = Boolean(discordUser.verified);

  let avatarUrl: string | null = null;
  if (discordUser.avatar) {
    avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`;
  }

  const displayName = (discordUser as any).global_name || discordUser.username;

    try {
      const oauthAccountRepository = createOAuthAccountRepository(db);
      const userRepository = createUserRepository(db);

      return await executeTransaction(db, async (tx) => {
        const existingAccount = await oauthAccountRepository.findByProvider('discord', providerId);

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
          const existingUserByEmail = email ? await userRepository.findByEmail(email) : null;

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
            if (email) {
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
              provider: 'discord',
              providerId,
              userId
            },
            tx
          );
        }

        const sessionToken = await createSession(userId);

        return {
          sessionToken,
          userId,
          user: user
            ? {
                ...user,
                displayName: displayName || user.displayName,
                avatarUrl: avatarUrl || user.avatarUrl
              }
            : undefined,
          hasUsername: Boolean(user?.username && !user.username.startsWith('user_'))
        };
      });
    } catch (dbErr) {
      console.warn('[Discord OAuth] DB unavailable, creating dev in-memory session with real Discord profile:', dbErr);
      const cleanUsername =
        discordUser.username.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
        `user_${discordUser.id.slice(-4)}`;
      const { createDevSocialSession } = await import('../dev-auth');
      const { sessionToken, user: devUser } = await createDevSocialSession('discord', {
        username: cleanUsername,
        displayName,
        email: email || `${cleanUsername}@discord.user`,
        avatarUrl
      });
      return {
        sessionToken,
        userId: devUser.id,
        user: devUser,
        hasUsername: true
      };
    }
}
