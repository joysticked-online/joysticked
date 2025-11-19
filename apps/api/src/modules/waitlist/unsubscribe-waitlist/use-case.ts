import { envs } from '../../../shared/config/envs';
import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { executeTransaction } from '../../../shared/database/transaction';
import { emailService } from '../../../shared/providers/emails';
import type { UnsubscribeFromWaitlist } from './schemas';

export async function unsubscribeFromWaitlistUseCase(db: Database, data: UnsubscribeFromWaitlist) {
  const waitlistRepository = createWaitListRepository(db);

  return executeTransaction(db, async (tx) => {
    await waitlistRepository.deleteByEmail(data.email, tx);

    await emailService.removeFromAudience({
      email: data.email,
      audienceId: envs.services.RESEND_WAITLIST_AUDIENCE_ID
    });
  });
}
