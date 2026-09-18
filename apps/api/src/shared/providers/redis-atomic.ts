import { redis } from './redis';

/** Atomically reads and deletes one Redis value. Requires Redis 6.2 or newer. */
export async function consumeRedisValue(key: string): Promise<string | null> {
  const value = await redis.send('GETDEL', [key]);
  return typeof value === 'string' ? value : null;
}
