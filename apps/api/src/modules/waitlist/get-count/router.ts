import Elysia from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { getWaitlistCountSuccessReponseSchema } from './schemas';
import { getWaitlistCount } from './use-case';

export const getWaitlistRouter = new Elysia().use(databaseMiddleware).get(
  '/',
  async ({ db, status }) => {
    const count = await getWaitlistCount(db);

    return status(200, { count });
  },
  {
    response: {
      200: getWaitlistCountSuccessReponseSchema
    }
  }
);
