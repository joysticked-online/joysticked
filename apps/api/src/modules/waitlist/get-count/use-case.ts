import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';

export async function getWaitlistCount(db: Database) {
  const waitlistRepository = createWaitListRepository(db);

  return await waitlistRepository.getEntriesCount();
}
