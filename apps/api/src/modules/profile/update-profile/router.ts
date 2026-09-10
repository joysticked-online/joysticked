import { Elysia } from 'elysia';
import z from 'zod';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { toPublicProfile } from '../get-profile/schemas';
import { updateProfileBodySchema, updateProfileResponseSchema } from './schemas';
import { updateProfileUseCase } from './use-case';

export const updateProfileRouter = new Elysia()
  .use(databaseMiddleware)
  .use(authMiddleware)
  .put(
    '/:id',
    async ({ params, body, db, status, userId }) => {
      if (!userId || userId !== params.id) {
        return status(403, { message: 'Forbidden' });
      }

      const { profile } = await updateProfileUseCase(db, { id: params.id, ...body });

      return status(200, { profile: toPublicProfile(profile) });
    },
    {
      params: z.object({ id: z.uuid() }),
      body: updateProfileBodySchema,
      response: {
        200: updateProfileResponseSchema
      }
    }
  );
