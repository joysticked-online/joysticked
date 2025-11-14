import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { ResourceNotFoundError } from '../../../shared/errors/resource-not-found-error';
import type { GetWaitlistJoinDate } from './schemas';

export async function getWaitlistJoinDateUseCase(db: Database, data: GetWaitlistJoinDate) {
  const waitlistRepository = createWaitListRepository(db);

  const waitlistEntry = await waitlistRepository.findByEmail(data.email);

  if (!waitlistEntry) {
    throw new ResourceNotFoundError('Waitlist entry not found');
  }

  return waitlistEntry.joinedAt;
}
