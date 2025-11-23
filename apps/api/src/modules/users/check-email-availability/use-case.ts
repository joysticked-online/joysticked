import type { Database } from '../../../shared/database';
import { createUsersRepository } from '../../../shared/database/repositories/users-repository';
import { ConflictError } from '../../../shared/errors/conflict-error';
import type { CheckEmailAvailability } from './schemas';

export async function checkEmailAvailability(db: Database, data: CheckEmailAvailability) {
  const usersRepository = createUsersRepository(db);

  const user = await usersRepository.findByEmail(data.email);

  if (user) throw new ConflictError('User with this email already exists');

  return true as const;
}
