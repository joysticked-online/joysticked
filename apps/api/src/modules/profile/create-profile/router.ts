import { Elysia } from 'elysia';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { createProfileBodySchema, createProfileResponseSchema } from './schemas';
import { createProfileUseCase } from './use-case';

export const createProfileRouter = new Elysia()
  .use(databaseMiddleware)
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, db, status, userId }) => {
      if (!userId) {
        return status(401, { message: 'Unauthorized' });
      }

      const { profile } = await createProfileUseCase(db, { id: userId, ...body });

      return status(201, profile);
    },
    {
      body: createProfileBodySchema,
      response: {
        201: createProfileResponseSchema
      }
    }
  );
