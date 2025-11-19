import { logger } from '@bogeychan/elysia-logger';
import cors from '@elysiajs/cors';
import openapi from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { z } from 'zod';

import { waitlistRouter } from '../../modules/waitlist/router';
import { envs } from '../config/envs';
import { errorHandler } from './middlewares/error-handler';
import { rateLimitMiddleware } from './middlewares/rate-limitter';

const app = new Elysia()
  .use(cors())
  .use(
    logger({
      level: 'info'
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
  .use(waitlistRouter)
  .listen(envs.app.PORT, ({ port, hostname }) =>
    console.log(`Server running on port http://${hostname}:${port}`)
  );

export type App = typeof app;
