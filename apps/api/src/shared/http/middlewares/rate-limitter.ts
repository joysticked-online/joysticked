import type { Algorithm } from 'bunlimit';
import { Ratelimit } from 'bunlimit';
import Elysia from 'elysia';

import { RateLimitError } from '../../errors/rate-limit-error';
import { redis } from '../../providers/redis';

export const rateLimitMiddleware = ({ strategy, key }: { strategy: Algorithm; key?: string }) =>
  new Elysia({ name: 'rate-limit' }).onBeforeHandle({ as: 'scoped' }, async ({ request }) => {
    const ratelimit = new Ratelimit({
      redis,
      limiter: strategy
    });

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { success } = await ratelimit.limit(key ? `${key}:${ip}` : ip);

    if (!success) throw new RateLimitError('Rate limit exceeded');

    return;
  });
