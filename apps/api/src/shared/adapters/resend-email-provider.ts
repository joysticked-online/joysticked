import { Resend } from 'resend';
import type { EmailProvider } from '../ports/email-provider';
import { envs } from '../config/envs';

export class ResendEmailProvider implements EmailProvider {
  private readonly resend = new Resend(envs.RESEND_API_KEY);

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      html: body
    });
  }
}
