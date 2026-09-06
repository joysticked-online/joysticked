import type { Database } from '../../../shared/database';
import { createUserRepository } from '../../../shared/database/repositories/user-repository';
import { UnauthorizedError } from '../../../shared/errors/unauthorized-error';

export async function getMeUseCase(db: Database, userId: string | null) {
  if (!userId) {
    throw new UnauthorizedError('Not authenticated');
  }

  const userRepository = createUserRepository(db);
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new UnauthorizedError('User session invalid');
  }

  return { user };
}
