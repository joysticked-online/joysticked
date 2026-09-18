import { fixedWindow } from 'bunlimit';
import { Elysia } from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { rateLimitMiddleware } from '../../../shared/http/middlewares/rate-limitter';
import { verifyEmailValidationBodySchema, verifyEmailValidationResponseSchema } from './schemas';
import { verifyEmailValidationUseCase } from './use-case';

export const verifyEmailValidationRouter = new Elysia()
  .use(
    rateLimitMiddleware({
      strategy: fixedWindow(10, 600),
      key: 'email-validation-verify',
      failClosed: true
    })
  )
  .use(databaseMiddleware)
  .post(
    '/email-validation/verify',
    async ({ body, db, status }) => {
      const result = await verifyEmailValidationUseCase(db, body);
      return status(200, { verified: result.verified });
    },
    {
      body: verifyEmailValidationBodySchema,
      response: { 200: verifyEmailValidationResponseSchema }
    }
  );
