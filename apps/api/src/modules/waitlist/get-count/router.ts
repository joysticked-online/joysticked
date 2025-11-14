import { Elysia } from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { getWaitlistCountUseCase } from './use-case';

export const getWaitlistRouter = new Elysia()
  .use(databaseMiddleware)
  .get('/', async ({ db, status }) => {
    const count = await getWaitlistCountUseCase(db);

    return status(200, { count });
  });
