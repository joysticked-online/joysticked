import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

import { envs } from '../../config/envs';
import { InternalServerError } from '../../errors/internal-server-error';
import WelcomeToTheWaitlistTemplate from './templates/welcome-to-the-waitlist';
import AuthEmailOTPTemplate from './templates/auth-email-otp';

type EmailTemplate = 'waitlist-welcome' | 'auth-email-otp';

type TemplatePayload = {
  otp?: string;
  type?: 'sign-in' | 'email-verification' 
  expiresInMinutes?: number;
};

type SendEmailParams = {
  to: string;
  template: EmailTemplate;
  payload?: TemplatePayload;
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
    
    if (domain.includes('@')) {
      return `Joysticked <${domain}>`;
    }
    
    return `Joysticked <${type}@${domain}>`;
  }

  private getTemplateConfig(template: EmailTemplate, payload?: TemplatePayload): TemplateConfig {
    switch (template) {
      case 'waitlist-welcome':
        return {
          subject: 'Welcome to the Joysticked Waitlist',
          component: WelcomeToTheWaitlistTemplate(),
          senderType: 'hello'
        };

        case 'auth-email-otp': {
          if (!payload?.otp || !payload.type) {
            throw new InternalServerError('Missing OTP payload for auth email template');
          }

          const subjects: Record<
            NonNullable<TemplatePayload['type']>,
            string
          > = {
            'sign-in': 'Your Joysticked sign-in code',
            'email-verification': 'Verify your Joysticked email'
          };

          const subject = subjects[payload.type];

          return {
            subject,
            component: AuthEmailOTPTemplate({
              otp: payload.otp,
              type: payload.type,
              expiresInMinutes: payload.expiresInMinutes ?? 5
            }),
            senderType: 'auth'
          };
        }

      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  }

  public async sendEmail({ to, template, payload, idempotencyKey }: SendEmailParams) {
    const domain = this.getEmailDomain();
    const config = this.getTemplateConfig(template, payload);
    const html = await render(config.component);


    try {
      const replyToDomain = domain.includes('@') ? domain.split('@')[1] : domain;

      const result = await this.client.emails.send(
        {
          to: [to],
          from: this.getSenderEmail(config.senderType),
          subject: config.subject,
          html,
          replyTo: `no-reply@${replyToDomain}`
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
      const isErrorInstance = error instanceof Error;

      if (!isErrorInstance) {
        throw new InternalServerError((error as Error).message);
      }

      throw new InternalServerError(`Email sending failed`);
    }
  }
}

export const emailService = EmailService.getInstance();
