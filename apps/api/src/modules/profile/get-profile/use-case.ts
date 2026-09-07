import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';

export async function getProfileUseCase(db: Database, { id }: { id: string }) {
  const profileRepository = createProfileRepository(db);

  const profile = await profileRepository.findById(id);

  if (!profile) {
    throw new ResourceNotFoundError('Profile not found');
  }

  return { profile };
}
