import type { Algorithm } from 'bunlimit';
import { Ratelimit } from 'bunlimit';
import Elysia from 'elysia';

import { RateLimitError } from '../../errors/rate-limit-error';
import { ServiceUnavailableError } from '../../errors/service-unavailable-error';
import { envs } from '../../config/envs';
import { redis } from '../../providers/redis';

type RateLimitOptions = {
  strategy: Algorithm;
  key?: string;
  failureMode?: 'open' | 'closed';
};

const clientIdentifier = (request: Request) => {
  if (!envs.app.TRUST_PROXY) return 'direct-connection';

  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
};

export const rateLimitMiddleware = ({
  strategy,
  key,
  failureMode = 'open'
}: RateLimitOptions) =>
  new Elysia({ name: 'rate-limit' }).onBeforeHandle({ as: 'scoped' }, async ({ request }) => {
    try {
      const ratelimit = new Ratelimit({
        redis,
        limiter: strategy
      });

      const ip = clientIdentifier(request);

      const { success } = await ratelimit.limit(key ? `${key}:${ip}` : ip);

      if (!success) throw new RateLimitError('Rate limit exceeded');
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      console.warn('[RateLimit] Redis unavailable:', (err as Error)?.message);

      if (failureMode === 'closed') {
        throw new ServiceUnavailableError('Authentication is temporarily unavailable');
      }
    }

    return;
  });
