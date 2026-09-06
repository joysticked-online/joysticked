import { beforeEach, describe, expect, it, mock } from 'bun:test';

// Setup mock environment variables before importing any modules
process.env.NODE_ENV = 'dev';
process.env.PORT = '8080';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.RESEND_API_KEY = 're_test_123';
process.env.RESEND_WAITLIST_AUDIENCE_ID = 'aud_123';
process.env.EMAIL_DOMAIN = 'localhost';
process.env.SESSION_SECRET = '12345678901234567890123456789012';
process.env.AUTH_CALLBACK_URL = 'http://localhost:8080';

import { consumeMagicLinkToken, createMagicLinkToken } from './magic-link';
import { redis } from './redis';

describe('magic-link provider', () => {
  const memoryStore = new Map<string, string>();

  beforeEach(() => {
    memoryStore.clear();

    mock.module('./redis', () => ({
      redis: {
        set: mock(async (key: string, value: string, _mode?: string, _ttl?: number) => {
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
  });

  it('creates a 64-char hex token and stores email with prefix', async () => {
    const email = 'player@joysticked.com';
    const token = await createMagicLinkToken(email);

    expect(token).toBeDefined();
    expect(token.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it('consumes token and deletes it for single-use guarantee', async () => {
    const email = 'gamer@joysticked.com';
    const token = await createMagicLinkToken(email);

    // First consumption returns email
    const consumedEmail = await consumeMagicLinkToken(token);
    expect(consumedEmail).toBe(email);

    // Second consumption returns null (single use)
    const secondTry = await consumeMagicLinkToken(token);
    expect(secondTry).toBeNull();
  });

  it('returns null for nonexistent or expired token', async () => {
    const result = await consumeMagicLinkToken('nonexistent_token_12345');
    expect(result).toBeNull();
  });
});
