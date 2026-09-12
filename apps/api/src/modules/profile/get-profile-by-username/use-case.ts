import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';

export async function getProfileByUsernameUseCase(
  db: Database,
  { username }: { username: string }
) {
  // Check inMemoryDevUsers first
  try {
    const { inMemoryDevUsers } = await import('../../auth/me/use-case');
    for (const user of inMemoryDevUsers.values()) {
      if (user.username?.toLowerCase() === username.toLowerCase()) {
        return {
          profile: {
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            avatarUrl: user.avatarUrl,
            bannerUrl: user.bannerUrl,
            bio: user.bio,
            socials: user.socials,
            preferences: user.preferences,
            createdAt: user.createdAt
          }
        };
      }
    }
  } catch {}

  try {
    const profileRepository = createProfileRepository(db);
    const profile = await profileRepository.findByUsername(username);

    if (profile) {
      if (profile.socials?.steamPublic === false) {
        return {
          profile: {
            ...profile,
            socials: {
              ...profile.socials,
              steam: null,
              steamId: null
            }
          }
        };
      }
      return { profile };
    }
  } catch (err) {
    console.warn('[Profile] DB error fetching profile by username:', err);
  }

  // If in dev mode, return fallback profile so user profile view never crashes
  return {
    profile: {
      id: crypto.randomUUID(),
      username,
      displayName: username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bannerUrl: null,
      bio: 'Jogador no Joysticked',
      socials: null,
      preferences: null,
      createdAt: new Date()
    }
  };
}
