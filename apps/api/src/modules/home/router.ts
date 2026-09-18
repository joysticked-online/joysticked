import { fixedWindow } from 'bunlimit';
import { Elysia } from 'elysia';
import { rateLimitMiddleware } from '../../shared/http/middlewares/rate-limitter';
import { getHomeFeed } from './use-case';

export const homeRouter = new Elysia()
  .use(rateLimitMiddleware({ strategy: fixedWindow(60, 60), key: 'home' }))
  .get('/home', () => getHomeFeed());
