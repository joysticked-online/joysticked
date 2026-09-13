import { describe, expect, it } from 'bun:test';
import { render } from '@react-email/render';
import MagicLinkTemplate from './magic-link';

describe('MagicLinkTemplate', () => {
  it('renders the magic link email template with the verification link', async () => {
    const testLink = 'http://localhost:8080/auth/verify?token=abcdef1234567890';
    const html = await render(MagicLinkTemplate({ link: testLink }));

    expect(html).toBeDefined();
    expect(html).toContain(testLink);
    expect(html).toContain('Ready to log in to Joysticked?');
    expect(html).toContain('15 minutes');
    expect(html).toContain('Sign in to Joysticked');
  });

  it('escapes and sets correct button href target', async () => {
    const testLink = 'http://localhost:8080/auth/verify?token=xyz987';
    const html = await render(MagicLinkTemplate({ link: testLink }));

    expect(html).toContain(`href="${testLink}"`);
  });
});
