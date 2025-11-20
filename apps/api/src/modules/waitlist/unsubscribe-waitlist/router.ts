import { Elysia } from 'elysia';
import z from 'zod';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { unsubscribeFromWaitlistUseCase } from './use-case';

export const unsubscribeWaitlistRouter = new Elysia().use(databaseMiddleware).post(
  '/unsubscribe',
  async ({ body, db, status }) => {
    await unsubscribeFromWaitlistUseCase(db, { id: body.id });

    return status(204);
  },
  {
    body: z.object({ id: z.string() })
  }
);
