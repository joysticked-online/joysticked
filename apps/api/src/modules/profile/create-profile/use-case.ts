import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';

type CreateProfileInput = {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  socials?: {
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
    steam?: string | null;
    steamId?: string | null;
    steamPublic?: boolean | null;
    instagram?: string | null;
  } | null;
};

export async function createProfileUseCase(db: Database, { id, ...data }: CreateProfileInput) {
  const profileRepository = createProfileRepository(db);

  const existing = await profileRepository.findByUsername(data.username);
  if (existing && existing.id !== id) {
    throw new ConflictError(`Username "${data.username}" is already taken`);
  }

  return executeTransaction(db, async (tx) => {
    const currentProfile = await profileRepository.findById(id);
    if (!currentProfile) {
      throw new ResourceNotFoundError('User profile not found');
    }

    const profile = await profileRepository.update(id, data, tx);
    return { profile };
  });
}
