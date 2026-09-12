import type { Database } from '../../../shared/database';
import { envs } from '../../../shared/config/envs';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { inMemoryDevUsers } from '../../auth/me/use-case';
import { toPublicProfile } from '../get-profile/schemas';

export async function getProfileByUsernameUseCase(
  db: Database,
  { username }: { username: string }
) {
  // Check in-memory dev users first
  for (const [, devUser] of inMemoryDevUsers.entries()) {
    if (devUser.username?.toLowerCase() === username.toLowerCase()) {
      return { profile: toPublicProfile(devUser) };
    }
  }

  try {
    const profileRepository = createProfileRepository(db);
    const profile = await profileRepository.findByUsername(username);

    if (profile) {
      return { profile: toPublicProfile(profile) };
    }
  } catch (err) {
    if (envs.app.NODE_ENV !== 'dev') {
      throw err;
    }
  }

  if (envs.app.NODE_ENV === 'dev') {
    // Generate transient dev profile so UI doesn't break
    const fallbackProfile = {
      id: crypto.randomUUID(),
      username,
      displayName: username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bannerUrl: null,
      bio: null,
      socials: null,
      preferences: null,
      createdAt: new Date()
    };
    return { profile: toPublicProfile(fallbackProfile) };
  }

  throw new ResourceNotFoundError('Profile not found');
}
