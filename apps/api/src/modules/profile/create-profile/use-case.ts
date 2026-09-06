import { ConflictError } from '../../../shared/errors/conflict-error';
import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { executeTransaction } from '../../../shared/database/transaction';

type CreateProfileInput = {
  username: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  socials?: {
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
  } | null;
};

export async function createProfileUseCase(db: Database, data: CreateProfileInput) {
  const profileRepository = createProfileRepository(db);

  const existing = await profileRepository.findByUsername(data.username);
  if (existing) {
    throw new ConflictError(`Username "${data.username}" is already taken`);
  }

  return executeTransaction(db, async (tx) => {
    const profile = await profileRepository.create(data, tx);
    return { profile };
  });
}
