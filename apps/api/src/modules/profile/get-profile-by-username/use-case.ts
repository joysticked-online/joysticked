import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import { toPublicProfile } from '../get-profile/schemas';

export async function getProfileByUsernameUseCase(
  db: Database,
  { username }: { username: string }
) {
  const profileRepository = createProfileRepository(db);

  const profile = await profileRepository.findByUsername(username);

  if (!profile) {
    throw new ResourceNotFoundError('Profile not found');
  }

  return { profile: toPublicProfile(profile) };
}
