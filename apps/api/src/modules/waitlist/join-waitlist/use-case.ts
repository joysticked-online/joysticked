import type { Database } from '@/shared/database';
import { createWaitListRepository } from '@/shared/database/repositories/waitlist-repository';

export async function joinWaitlistUseCase(db: Database, { email }: { email: string }) {
  const waitlistRepository = createWaitListRepository(db);

  const existingEntry = await waitlistRepository.findEntryByEmail(email);
  if (existingEntry) {
    throw new Error('Email already exists in waitlist');
  }

  await waitlistRepository.createEntry(email);
}
