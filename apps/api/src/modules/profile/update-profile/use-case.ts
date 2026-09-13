import { envs } from '../../../shared/config/envs';
import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { inMemoryDevUsers } from '../../auth/me/use-case';

type UpdateProfileInput = {
  id: string;
  username?: string;
  displayName?: string | null;
  onboardingCompleted?: boolean;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  socials?: {
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
    steam?: string | null;
    instagram?: string | null;
  } | null;
  preferences?: {
    platforms?: string[];
    genres?: string[];
    likedGames?: string[];
  } | null;
};

export async function updateProfileUseCase(db: Database, { id, ...data }: UpdateProfileInput) {
  // Sync to in-memory dev users map if in dev
  if (envs.app.NODE_ENV === 'dev') {
    const existing = inMemoryDevUsers.get(id) || {
      id,
      username: data.username || `user_${id.slice(0, 6)}`,
      createdAt: new Date()
    };
    const updated = {
      ...existing,
      ...data,
      onboardingCompleted:
        data.onboardingCompleted !== undefined
          ? data.onboardingCompleted
          : existing.onboardingCompleted
    };
    inMemoryDevUsers.set(id, updated);
  }

  try {
    const profileRepository = createProfileRepository(db);

    if (data.username) {
      const existingProfile = await profileRepository.findByUsername(data.username);
      if (existingProfile && existingProfile.id !== id) {
        throw new ConflictError(`Username "${data.username}" is already taken`);
      }
    }

    const profile = await profileRepository.update(id, data);
    return { profile };
  } catch (err) {
    if (envs.app.NODE_ENV === 'dev') {
      const devProfile = inMemoryDevUsers.get(id);
      return { profile: devProfile };
    }
    throw err;
  }
}
