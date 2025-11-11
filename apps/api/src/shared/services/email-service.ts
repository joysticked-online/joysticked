import { render } from '@react-email/render';
import type { EmailProvider } from '../ports/email-provider';
import type { JSX } from 'react';

export class EmailService {
  constructor(private readonly emailProvider: EmailProvider) {}

  async sendEmail({
    email,
    subject,
    template
  }: {
    email: string;
    subject: string;
    template: JSX.Element;
  }): Promise<void> {
    const body = await render(template);
    await this.emailProvider.sendEmail(email, subject, body);
  }
}
