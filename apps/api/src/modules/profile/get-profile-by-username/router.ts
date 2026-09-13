import { Elysia } from 'elysia';
import z from 'zod';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { profileResponseSchema } from '../get-profile/schemas';
import { getProfileByUsernameUseCase } from './use-case';

export const getProfileByUsernameRouter = new Elysia().use(databaseMiddleware).get(
  '/u/:username',
  async ({ params, db, status }) => {
    const { profile } = await getProfileByUsernameUseCase(db, {
      username: params.username
    });

    return status(200, profile);
  },
  {
    params: z.object({ username: z.string().min(3).max(32) }),
    response: {
      200: profileResponseSchema
    }
  }
);
