import { envs } from '../../../shared/config/envs';
import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { emailService } from '../../../shared/providers/emails';
import type { UnsubscribeFromWaitlist } from './schemas';

export async function unsubscribeFromWaitlistUseCase(db: Database, data: UnsubscribeFromWaitlist) {
  const waitlistRepository = createWaitListRepository(db);

  const entry = await waitlistRepository.findById(data.id);
  if (!entry) return;

  if (entry.resendContactId) {
    await emailService.removeFromAudience({
      id: entry.resendContactId,
      audienceId: envs.services.RESEND_WAITLIST_AUDIENCE_ID
    });
  }

  await waitlistRepository.delete(entry.id);
}
