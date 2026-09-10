import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';

export async function getProfileByUsernameUseCase(
  db: Database,
  { username }: { username: string }
) {
  const profileRepository = createProfileRepository(db);

  const profile = await profileRepository.findByUsername(username);

  if (!profile) {
    throw new ResourceNotFoundError('Profile not found');
  }

  // Steam visibility is a public-profile concern. Never trust the frontend to
  // hide identifiers that can be returned by this API.
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
