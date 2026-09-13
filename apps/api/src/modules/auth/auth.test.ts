import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { Elysia } from 'elysia';
import { requestMagicLinkRouter } from './magic-link/router';
import { verifyMagicLinkRouter } from './verify/router';

describe('auth endpoints', () => {
  const memoryStore = new Map<string, string>();
  let emailSentTo: string | null = null;
  let emailLink: string | null = null;

  beforeEach(() => {
    memoryStore.clear();
    emailSentTo = null;
    emailLink = null;

    mock.module('bunlimit', () => ({
      fixedWindow: mock(() => ({})),
      tokenBucket: mock(() => ({})),
      Ratelimit: class {
        async limit() {
          return { success: true, remaining: 10, reset: 0 };
        }
      }
    }));

    mock.module('../../shared/providers/redis', () => ({
      redis: {
        set: mock(async (key: string, value: string) => {
          memoryStore.set(key, value);
          return 'OK';
        }),
        get: mock(async (key: string) => {
          return memoryStore.get(key) ?? null;
        }),
        del: mock(async (key: string) => {
          const existed = memoryStore.has(key);
          memoryStore.delete(key);
          return existed ? 1 : 0;
        })
      }
    }));

    mock.module('../../shared/providers/emails', () => ({
      emailService: {
        sendEmail: mock(async (params: any) => {
          emailSentTo = params.to;
          emailLink = params.link;
          return { data: { id: 'msg_123' } };
        })
      }
    }));
  });

  it('POST /auth/magic-link validates email and sends link', async () => {
    const app = new Elysia({ prefix: '/auth' }).use(requestMagicLinkRouter);

    const response = await app.handle(
      new Request('http://localhost:8080/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'player@joysticked.com' })
      })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ message: 'Magic link sent' });
    expect(emailSentTo).toBe('player@joysticked.com');
    expect(emailLink).toContain('/auth/verify?token=');
  });

  it('POST /auth/magic-link rejects invalid email format', async () => {
    const app = new Elysia({ prefix: '/auth' }).use(requestMagicLinkRouter);

    const response = await app.handle(
      new Request('http://localhost:8080/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' })
      })
    );

    expect(response.status).toBe(422);
  });

  it('GET /auth/verify redirects to error page when token is invalid or expired', async () => {
    const app = new Elysia({ prefix: '/auth' }).use(verifyMagicLinkRouter);

    const response = await app.handle(
      new Request('http://localhost:8080/auth/verify?token=invalid_token_123')
    );

    expect(response.status).toBe(302);
    const location = response.headers.get('location');
    expect(location).toContain('/auth?error=invalid_token');
  });
});
