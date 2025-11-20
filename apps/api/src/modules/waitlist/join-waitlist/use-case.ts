import { envs } from '../../../shared/config/envs';
import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { ConflictError } from '../../../shared/errors/conflict-error';
import { emailService } from '../../../shared/providers/emails';

export async function joinWaitlistUseCase(db: Database, { email }: { email: string }) {
  const waitlistRepository = createWaitListRepository(db);

  const existingEntry = await waitlistRepository.findByEmail(email);

  if (existingEntry) {
    throw new ConflictError('Email already exists in waitlist');
  }

  return executeTransaction(db, async (tx) => {
    const entry = await waitlistRepository.create(email, tx);

    await emailService.sendEmailAndAddToAudience({
      to: email,
      id: entry.id,
      template: 'waitlist-welcome',
      audienceId: envs.services.RESEND_WAITLIST_AUDIENCE_ID
    });

    return { entry };
  });
}
