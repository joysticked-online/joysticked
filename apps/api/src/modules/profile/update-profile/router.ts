import { Elysia } from 'elysia';
import z from 'zod';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { updateProfileBodySchema, updateProfileResponseSchema } from './schemas';
import { updateProfileUseCase } from './use-case';

export const updateProfileRouter = new Elysia().use(databaseMiddleware).put(
  '/:id',
  async ({ params, body, db, status }) => {
    const { profile } = await updateProfileUseCase(db, { id: params.id, ...body });

    return status(200, profile);
  },
  {
    params: z.object({ id: z.uuid() }),
    body: updateProfileBodySchema,
    response: {
      200: updateProfileResponseSchema
    }
  }
);
