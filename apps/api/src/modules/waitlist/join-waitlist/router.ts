import { Elysia } from 'elysia';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { joinWaitlistBodySchema, joinWaitlistSuccessResponseSchema } from './schemas';
import { joinWaitlistUseCase } from './use-case';

export const joinWaitlistRouter = new Elysia().use(databaseMiddleware).post(
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
