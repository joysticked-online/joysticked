import type { Database } from '../../../shared/database';
import { createProfileRepository } from '../../../shared/database/repositories/profile-repository';

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
  const profileRepository = createProfileRepository(db);

  // repository.update already throws ResourceNotFoundError if the profile doesn't exist
  const profile = await profileRepository.update(id, data);

  return { profile };
}
