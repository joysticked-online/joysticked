import { Elysia } from 'elysia';
import z from 'zod';
import { envs } from '../../../shared/config/envs';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { inMemoryDevUsers } from '../../auth/me/use-case';
import { toPublicProfile } from '../get-profile/schemas';
import { updateProfileBodySchema, updateProfileResponseSchema } from './schemas';
import { updateProfileUseCase } from './use-case';

export const updateProfileRouter = new Elysia()
  .use(databaseMiddleware)
  .use(authMiddleware)
  .put(
    '/:id',
    async ({ params, body, db, status, userId }) => {
      const isDev = envs.app.NODE_ENV === 'dev';
      const isAuthorized = userId && userId === params.id;
      const isDevAuthorized = isDev && (inMemoryDevUsers.has(params.id) || !userId || params.id.startsWith('usr_'));

      if (!isAuthorized && !isDevAuthorized) {
        return status(403, { message: 'Forbidden' });
      }

      const { profile } = await updateProfileUseCase(db, { id: params.id, ...body });

      return status(200, toPublicProfile(profile));
    },
    {
      params: z.object({ id: z.string() }),
      body: updateProfileBodySchema,
      response: {
        200: updateProfileResponseSchema,
        403: z.object({ message: z.string() })
      }
    }
  );
