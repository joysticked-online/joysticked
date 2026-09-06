import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { createSession, deleteSession, getSession } from './session';
import { redis } from './redis';

describe('session provider', () => {
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

  it('creates session token and retrieves userId', async () => {
    const userId = '11111111-1111-1111-1111-111111111111';
    const token = await createSession(userId);

    expect(token).toBeDefined();
    expect(token.length).toBe(64);

    const retrievedUserId = await getSession(token);
    expect(retrievedUserId).toBe(userId);
  });

  it('deletes session from redis on logout', async () => {
    const userId = '22222222-2222-2222-2222-222222222222';
    const token = await createSession(userId);

    expect(await getSession(token)).toBe(userId);

    await deleteSession(token);
    expect(await getSession(token)).toBeNull();
  });

  it('returns null for unknown token', async () => {
    const result = await getSession('nonexistent_session_token');
    expect(result).toBeNull();
  });
});
