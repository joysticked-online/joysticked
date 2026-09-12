import type { Database } from '../../../shared/database';
import { envs } from '../../../shared/config/envs';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { inMemoryDevUsers } from '../../auth/me/use-case';
import { toPublicProfile } from './schemas';

export async function getProfileUseCase(db: Database, { id }: { id: string }) {
  if (inMemoryDevUsers.has(id)) {
    return { profile: toPublicProfile(inMemoryDevUsers.get(id)) };
  }

  try {
    const profileRepository = createProfileRepository(db);
    const profile = await profileRepository.findById(id);

    if (profile) {
      return { profile: toPublicProfile(profile) };
    }
  } catch (err) {
    if (envs.app.NODE_ENV !== 'dev') {
      throw err;
    }
  }

  if (envs.app.NODE_ENV === 'dev') {
    const fallbackProfile = {
      id,
      username: `user_${id.slice(0, 6)}`,
      displayName: 'Jogador',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
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
