import type { Database } from '../../../shared/database';
import { createUserRepository } from '../../../shared/database/repositories/user-repository';
import { UnauthorizedError } from '../../../shared/errors/unauthorized-error';
import { envs } from '../../../shared/config/envs';

export const inMemoryDevUsers = new Map<string, any>();

export async function getMeUseCase(db: Database, userId: string | null) {
  if (!userId) {
    throw new UnauthorizedError('Not authenticated');
  }

  // Check in-memory dev user first
  if (inMemoryDevUsers.has(userId)) {
    return { user: inMemoryDevUsers.get(userId) };
  }

  try {
    const userRepository = createUserRepository(db);
    const user = await userRepository.findById(userId);

    if (user) {
      return { user };
    }
  } catch (_err) {
    if (envs.app.NODE_ENV === 'dev') {
      const devUser = {
        id: userId,
        username: userId.replace('usr_dev_', '').replace('usr_', ''),
        displayName: 'Dev Gamer',
        email: `${userId}@joysticked.dev`,
        emailVerified: true,
        onboardingCompleted: true,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
        bannerUrl: null,
        bio: 'Jogador Joysticked',
        socials: null,
        preferences: null,
        createdAt: new Date()
      };
      return { user: devUser };
    }
  }

  if (envs.app.NODE_ENV === 'dev') {
    const devUser = {
      id: userId,
      username: userId.replace('usr_dev_', '').replace('usr_', ''),
      displayName: 'Dev Gamer',
      email: `${userId}@joysticked.dev`,
      emailVerified: true,
      onboardingCompleted: true,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      bannerUrl: null,
      bio: 'Jogador Joysticked',
      socials: null,
      preferences: null,
      createdAt: new Date()
    };
    return { user: devUser };
  }

  throw new UnauthorizedError('User session invalid');
}
