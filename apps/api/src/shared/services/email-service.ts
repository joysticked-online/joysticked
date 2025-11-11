
import type { EmailProvider } from '../ports/email-provider';

export class EmailService {
  constructor(private readonly emailProvider: EmailProvider) {}

  async sendWelcomeEmail(to: string): Promise<void> {
    const subject = 'Welcome to Joysticked!';
    const body = '<h1>Welcome!</h1><p>Thanks for joining our waitlist.</p>';
    await this.emailProvider.sendEmail(to, subject, body);
  }
}
