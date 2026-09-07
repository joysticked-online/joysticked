import { Elysia } from 'elysia';
import z from 'zod';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { profileResponseSchema } from './schemas';
import { getProfileUseCase } from './use-case';

export const getProfileRouter = new Elysia().use(databaseMiddleware).get(
  '/:id',
  async ({ params, db, status }) => {
    const { profile } = await getProfileUseCase(db, { id: params.id });

    return status(200, profile);
  },
  {
    params: z.object({ id: z.uuid() }),
    response: {
      200: profileResponseSchema
    }
  }
);
