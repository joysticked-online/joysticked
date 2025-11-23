import Elysia from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { createUserBodySchema } from './schemas';
import { createUserUseCase } from './use-case';

export const createUserRouter = new Elysia().use(databaseMiddleware).post(
  '/',
  async ({ db, body, status }) => {
    await createUserUseCase(db, {
      handle: body.handle,
      emailValidationRequestId: body.emailValidationRequestId,
      phoneNumberValidationRequestId: body.phoneNumberValidationRequestId
    });

    return status(204);
  },
  {
    body: createUserBodySchema
  }
);
