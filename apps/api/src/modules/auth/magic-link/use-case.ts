import { envs } from '../../../shared/config/envs';
import { emailService } from '../../../shared/providers/emails';
import { createMagicLinkToken } from '../../../shared/providers/magic-link';

export async function requestMagicLinkUseCase({ email }: { email: string }) {
  const token = await createMagicLinkToken(email);

  // Link points to API verify endpoint which verifies token, sets session cookie, and redirects
  const verifyUrl = `${envs.auth.AUTH_CALLBACK_URL}/auth/verify?token=${token}`;

  await emailService.sendEmail({
    to: email,
    template: 'magic-link',
    link: verifyUrl
  });

  return { message: 'Magic link sent' };
}
