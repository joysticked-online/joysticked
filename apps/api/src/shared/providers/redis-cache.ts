import { redis } from './redis';

const CACHE_PREFIX = 'cache:v1:';

export async function getCachedJson<T>(key: string, parse: (value: unknown) => T): Promise<T | null> {
  const raw = await redis.get(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;
  try {
    return parse(JSON.parse(raw) as unknown);
  } catch {
    await redis.del(`${CACHE_PREFIX}${key}`);
    return null;
  }
}

export async function setCachedJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await redis.set(`${CACHE_PREFIX}${key}`, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function withRedisCache<T>(options: { key: string; ttlSeconds: number; parse: (value: unknown) => T; load: () => Promise<T> }): Promise<T> {
  try {
    const cached = await getCachedJson(options.key, options.parse);
    if (cached !== null) return cached;
  } catch {
    // External providers remain available when Redis is unavailable.
  }
  const value = await options.load();
  try { await setCachedJson(options.key, value, options.ttlSeconds); } catch { /* cache failure is non-fatal */ }
  return value;
}
