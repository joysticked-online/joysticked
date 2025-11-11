import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { Resend } from 'resend';
import { envs } from '../../config/envs';
import WelcomeToTheWaitlistTemplate from './templates/welcome-to-the-waitlist';

type EmailTemplate = 'waitlist-welcome';

type SendEmailParams = {
  to: string;
  template: EmailTemplate;
  idempotencyKey?: string;
};

type TemplateConfig = {
  subject: string;
  component: ReactElement;
  senderType: string;
};

class EmailService {
  private static instance: EmailService;
  private client: Resend;

  private constructor() {
    this.client = new Resend(envs.services.RESEND_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private isLocalEnvironment(): boolean {
    return (
      envs.services.EMAIL_DOMAIN.includes('localhost') ||
      envs.services.EMAIL_DOMAIN.includes('127.0.0.1')
    );
  }

  private getEmailDomain(): string {
    return this.isLocalEnvironment() ? 'resend.dev' : envs.services.EMAIL_DOMAIN;
  }

  private getSenderEmail(type: string = 'hello'): string {
    const domain = this.getEmailDomain();
    return `Joysticked <${type}@${domain}>`;
  }

  private getTemplateConfig(template: EmailTemplate): TemplateConfig {
    switch (template) {
      case 'waitlist-welcome':
        return {
          subject: 'Welcome to the Joysticked Waitlist',
          component: WelcomeToTheWaitlistTemplate(),
          senderType: 'hello'
        };
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  }

  public async sendEmail({ to, template, idempotencyKey }: SendEmailParams) {
    const domain = this.getEmailDomain();
    const config = this.getTemplateConfig(template);
    const html = await render(config.component);

    try {
      const result = await this.client.emails.send(
        {
          to: [to],
          from: this.getSenderEmail(config.senderType),
          subject: config.subject,
          html,
          replyTo: `no-reply@${domain}`
        },
        {
          idempotencyKey
        }
      );

      if (!result.data?.id) {
        throw new Error('Failed to send email');
      }

      return result;
    } catch (error) {
      throw new Error(`Email sending failed: ${(error as Error).message}`);
    }
  }
}

export const emailService = EmailService.getInstance();
