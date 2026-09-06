import { Elysia } from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { createProfileBodySchema, createProfileResponseSchema } from './schemas';
import { createProfileUseCase } from './use-case';

export const createProfileRouter = new Elysia()
  .use(databaseMiddleware)
  .post(
    '/',
    async ({ body, db, status }) => {
      const { profile } = await createProfileUseCase(db, body);

      return status(201, profile);
    },
    {
      body: createProfileBodySchema,
      response: {
        201: createProfileResponseSchema
      }
    }
  );
