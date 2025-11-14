import { Elysia } from 'elysia';
import z from 'zod';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { zDate } from '../../../shared/schemas/zod-date';
import { getWaitlistJoinDateQuerySchema } from './schemas';
import { getWaitlistJoinDateUseCase } from './use-case';

export const getWaitlistJoinDateRouter = new Elysia().use(databaseMiddleware).get(
  '/join-date',
  async ({ db, status, query }) => {
    const joinDate = await getWaitlistJoinDateUseCase(db, {
      email: query.email
    });

    return status(200, { joinDate });
  },
  {
    query: getWaitlistJoinDateQuerySchema,
    response: {
      200: z.object({ joinDate: zDate })
    }
  }
);
