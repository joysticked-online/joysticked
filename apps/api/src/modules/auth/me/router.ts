import { Elysia } from 'elysia';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { meResponseSchema } from './schemas';
import { getMeUseCase } from './use-case';

export const meRouter = new Elysia()
  .use(authMiddleware)
  .use(databaseMiddleware)
  .get(
    '/me',
    async ({ userId, db, status }) => {
      const { user } = await getMeUseCase(db, userId);
      return status(200, user);
    },
    {
      response: {
        200: meResponseSchema
      }
    }
  );
