// Import react-dom/server before @react-email/render to ensure it's bundled correctly
import 'react-dom/server';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';
import { Resend } from 'resend';

import { envs } from '../../config/envs';
import { InternalServerError } from '../../errors/internal-server-error';
import { ResourceNotFoundError } from '../../errors/resource-not-found-error';
import WelcomeToTheWaitlistTemplate from './templates/welcome-to-the-waitlist';

type EmailTemplate = 'waitlist-welcome';

type SendEmailParams = {
  to: string;
  template: EmailTemplate;
  idempotencyKey?: string;
  id: string;
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

  private getTemplateConfig(template: EmailTemplate, { id }: { id: string }): TemplateConfig {
    switch (template) {
      case 'waitlist-welcome':
        return {
          subject: 'Welcome to the Joysticked Waitlist',
          component: WelcomeToTheWaitlistTemplate({ id }),
          senderType: 'hello'
        };
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  }

  public async sendEmail({ to, template, idempotencyKey, id }: SendEmailParams) {
    const domain = this.getEmailDomain();
    const config = this.getTemplateConfig(template, { id });
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
      const isErrorInstance = error instanceof Error;

      if (!isErrorInstance) {
        throw new InternalServerError((error as Error).message);
      }

      throw new InternalServerError(`Email sending failed`);
    }
  }

  public async sendEmailAndAddToAudience({
    to,
    template,
    idempotencyKey,
    audienceId,
    id
  }: SendEmailParams & { audienceId: string; id: string }) {
    let contact: Awaited<ReturnType<typeof this.client.contacts.create>>['data'] | null = null;

    try {
      contact = (
        await this.client.contacts.create({
          email: to,
          audienceId
        })
      ).data;

      const result = await this.sendEmail({ to, template, idempotencyKey, id });

      return result;
    } catch (error) {
      if (contact) {
        await this.client.contacts.remove({ id: contact.id, audienceId });
      }

      throw error;
    }
  }

  public async removeFromAudience({ id, audienceId }: { id: string; audienceId: string }) {
    const contact = await this.client.contacts.get({ id, audienceId });

    if (!contact.data) {
      throw new ResourceNotFoundError(`Contact not found for id: ${id}`);
    }

    await this.client.contacts.remove({ id, audienceId });
  }
}

export const emailService = EmailService.getInstance();
