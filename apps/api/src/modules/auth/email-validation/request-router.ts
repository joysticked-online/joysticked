import { fixedWindow } from 'bunlimit';
import { Elysia } from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { rateLimitMiddleware } from '../../../shared/http/middlewares/rate-limitter';
import { requestEmailValidationBodySchema, requestEmailValidationResponseSchema } from './schemas';
import { requestEmailValidationUseCase } from './use-case';

export const requestEmailValidationRouter = new Elysia()
  .use(
    rateLimitMiddleware({
      strategy: fixedWindow(5, 600),
      key: 'email-validation-request',
      failClosed: true
    })
  )
  .use(databaseMiddleware)
  .post(
    '/email-validation/request',
    async ({ body, db, status }) => status(200, await requestEmailValidationUseCase(db, body)),
    {
      body: requestEmailValidationBodySchema,
      response: { 200: requestEmailValidationResponseSchema }
    }
  );
