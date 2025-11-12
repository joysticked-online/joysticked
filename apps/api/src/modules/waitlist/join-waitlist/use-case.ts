import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { InternalServerError } from '../../../shared/errors/internal-server-error';
import { emailService } from '../../../shared/providers/emails';

export async function joinWaitlistUseCase(db: Database, { email }: { email: string }) {
  const waitlistRepository = createWaitListRepository(db);

  const existingEntry = await waitlistRepository.findByEmail(email);
  if (existingEntry) {
    throw new ConflictError('Email already exists in waitlist');
  }

  return executeTransaction(db, async (tx) => {
    const entry = await waitlistRepository.create(email, tx);

    const { error } = await emailService.sendEmail({
      to: email,
      template: 'waitlist-welcome'
    });

    if (error) throw new InternalServerError('Failed to send email');

    return { entry };
  });
}
