import type { Database } from '../../../shared/database';
import { createWaitListRepository } from '../../../shared/database/repositories/waitlist-repository';
import { ResendEmailProvider } from '../../../shared/adapters/resend-email-provider';
import { EmailService } from '../../../shared/services/email-service';
import EmailJoinWaitlistTemplate from '../../../shared/services/emails/email-join-waitlist-template';

export async function joinWaitlistUseCase(db: Database, { email }: { email: string }) {
  const waitlistRepository = createWaitListRepository(db);
  const emailProvider = new ResendEmailProvider();
  const emailService = new EmailService(emailProvider);

  const existingEntry = await waitlistRepository.findEntryByEmail(email);
  if (existingEntry) {
    throw new Error('Email already exists in waitlist');
  }

  await waitlistRepository.createEntry(email);
  await emailService.sendEmail({
    email,
    subject: 'Welcome to our waitlist!',
    template: EmailJoinWaitlistTemplate()
  });
}
