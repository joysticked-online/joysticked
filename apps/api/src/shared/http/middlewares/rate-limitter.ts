import type { Algorithm } from 'bunlimit';
import { Ratelimit } from 'bunlimit';
import Elysia from 'elysia';
import { envs } from '../../config/envs';
import { InternalServerError } from '../../errors/internal-server-error';
import { RateLimitError } from '../../errors/rate-limit-error';
import { redis } from '../../providers/redis';

export const rateLimitMiddleware = ({
  strategy,
  key,
  failClosed = false
}: {
  strategy: Algorithm;
  key?: string;
  failClosed?: boolean;
}) =>
  new Elysia({ name: 'rate-limit' }).onBeforeHandle({ as: 'scoped' }, async ({ request, server }) => {
    try {
      const ratelimit = new Ratelimit({
        redis,
        limiter: strategy
      });

      const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim();
      const directIp = request.headers.get('x-real-ip')?.trim();
      const socketIp = server?.requestIP(request)?.address;
      const ip = envs.app.TRUSTED_PROXY
        ? forwardedIp || directIp || socketIp || 'unknown'
        : socketIp || 'unknown';

      const { success } = await ratelimit.limit(key ? `${key}:${ip}` : ip);

      if (!success) throw new RateLimitError('Rate limit exceeded');
    } catch (err) {
      if (err instanceof RateLimitError) throw err;
      if (failClosed) throw new InternalServerError('Authentication temporarily unavailable');
    }

    return;
  });
