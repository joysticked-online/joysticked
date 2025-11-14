import openapi from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { z } from 'zod';

import { waitlistRouter } from '../../modules/waitlist/router';
import { envs } from '../config/envs';
import { errorHandler } from './middlewares/error-handler';
import { rateLimitMiddleware } from './middlewares/rate-limitter';
import cors from '@elysiajs/cors';
import { betterAuthMiddleware } from './middlewares/better-auth';

const app = new Elysia()
  .use(
    cors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .use(errorHandler)
  .use(rateLimitMiddleware)
  .use(
    openapi({
      path: '/swagger',
      mapJsonSchema: {
        zod: z.toJSONSchema
      }
    })
  )
  .use(betterAuthMiddleware)
  .use(waitlistRouter)
  .listen(envs.app.PORT, ({ port, hostname }) =>
    console.log(`Server running on port http://${hostname}:${port}`)
  );

export type App = typeof app;
