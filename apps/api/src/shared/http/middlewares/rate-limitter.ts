import { Ratelimit, tokenBucket } from 'bunlimit';
import Elysia from 'elysia';

import { RateLimitError } from '../../errors/rate-limit-error';
import { redis } from '../../providers/redis';

const ratelimit = new Ratelimit({
  redis,
  limiter: tokenBucket(5, 30)
});

export const rateLimitMiddleware = new Elysia({ name: 'rate-limit' }).onBeforeHandle(
  { as: 'global' },
  async ({ request }) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { success } = await ratelimit.limit(ip);

    if (!success) throw new RateLimitError('Rate limit exceeded');

    return;
  }
);
