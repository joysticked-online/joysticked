import { Elysia } from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { joinWaitlistBodySchema, joinWaitlistSuccessResponseSchema } from './schemas';
import { joinWaitlistUseCase } from './use-case';
import { rateLimitMiddleware } from '../../../shared/http/middlewares/rate-limitter';
import { fixedWindow } from 'bunlimit';

export const joinWaitlistRouter = new Elysia()
  .use(rateLimitMiddleware({ strategy: fixedWindow(5, 120), key: 'join-waitlist' }))
  .use(databaseMiddleware)
  .post(
    '/join',
    async ({ body, status, db }) => {
      const { entry } = await joinWaitlistUseCase(db, { email: body.email });

      return status(201, entry);
    },
    {
      body: joinWaitlistBodySchema,
      response: {
        201: joinWaitlistSuccessResponseSchema
      }
    }
  );
