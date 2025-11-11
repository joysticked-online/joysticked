import type { CreateEmailResponse } from 'resend';

export interface EmailProvider {
  sendEmail({
    type,
    to,
    subject,
    body
  }: {
    type: 'hello' | 'waitlist';
    to: string;
    subject: string;
    body: string;
  }): Promise<CreateEmailResponse>;
}
