import { tokenBucket } from 'bunlimit';
import { Elysia } from 'elysia';
import { rateLimitMiddleware } from '../../shared/http/middlewares/rate-limitter';
import { getWaitlistRouter } from './get-count/router';
import { getWaitlistJoinDateRouter } from './get-waitlist-join-date/router';
import { joinWaitlistRouter } from './join-waitlist/router';
import { unsubscribeWaitlistRouter } from './unsubscribe-waitlist/router';

export const waitlistRouter = new Elysia({ prefix: '/waitlist', tags: ['waitlist'] })
  .use(joinWaitlistRouter)
  .group('', (app) =>
    app
      .use(rateLimitMiddleware({ strategy: tokenBucket(5, 30) }))
      .use([getWaitlistRouter, getWaitlistJoinDateRouter, unsubscribeWaitlistRouter])
  );
