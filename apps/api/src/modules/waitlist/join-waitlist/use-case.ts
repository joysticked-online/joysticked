import { InternalServerError } from 'elysia';
import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { emailService } from '../../../shared/providers/emails';

export async function joinWaitlistUseCase(db: Database, { email }: { email: string }) {
  const waitlistRepository = createWaitListRepository(db);

  const existingEntry = await waitlistRepository.findEntryByEmail(email);
  if (existingEntry) {
    throw new Error('Email already exists in waitlist');
  }

  return executeTransaction(db, async (tx) => {
    const entry = await waitlistRepository.createEntry(email, tx);

    const { error } = await emailService.sendEmail({
      to: email,
      template: 'waitlist-welcome'
    });

    if (error) throw new InternalServerError('Failed to send email');

    return { entry };
  });
}
