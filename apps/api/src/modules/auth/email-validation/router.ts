import { Elysia } from 'elysia';

import { requestEmailValidationRouter } from './request-router';
import { verifyEmailValidationRouter } from './verify-router';

export const emailValidationRouter = new Elysia()
  .use(requestEmailValidationRouter)
  .use(verifyEmailValidationRouter);
