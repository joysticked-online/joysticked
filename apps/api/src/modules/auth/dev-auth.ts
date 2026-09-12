import { createSession } from '../../shared/providers/session';
import { inMemoryDevUsers } from './me/use-case';

export async function createDevSocialSession(
  provider: 'google' | 'discord',
  customData?: Partial<{
    id: string;
    username: string;
    displayName: string | null;
    email: string | null;
    avatarUrl: string | null;
  }>
) {
  const userId = customData?.id || crypto.randomUUID();
  const username = customData?.username || `${provider}_player`;
  const displayName =
    customData?.displayName !== undefined
      ? customData.displayName
      : provider === 'discord'
        ? 'Discord Gamer'
        : 'Google Gamer';
  const email = customData?.email !== undefined ? customData.email : `${provider}@joysticked.dev`;
  const avatarUrl =
    customData?.avatarUrl !== undefined
      ? customData.avatarUrl
      : provider === 'discord'
        ? 'https://cdn.discordapp.com/embed/avatars/0.png'
        : 'https://api.dicebear.com/7.x/bottts/svg?seed=google_player';

  const user = {
    id: userId,
    username,
    displayName,
    email,
    emailVerified: true,
    onboardingCompleted: true,
    avatarUrl,
    bannerUrl: null,
    bio: `Jogador verificado via ${provider}`,
    socials: { [provider]: username },
    preferences: null,
    createdAt: new Date()
  };

  inMemoryDevUsers.set(userId, user);
  const sessionToken = await createSession(userId);
  return { sessionToken, user };
}
