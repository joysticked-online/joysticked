import { logger } from '@bogeychan/elysia-logger';
import cors from '@elysiajs/cors';
import openapi from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { z } from 'zod';

import { usersRouter } from '../../modules/users/router';
import { waitlistRouter } from '../../modules/waitlist/router';
import { envs } from '../config/envs';
import { errorHandler } from './middlewares/error-handler';

const app = new Elysia()
  .use(cors())
  .use(
    logger({
      level: 'info'
    })
  )
  .use(errorHandler)
  .use(
    openapi({
      path: '/swagger',
      mapJsonSchema: {
        zod: z.toJSONSchema
      }
    })
  )
  .use([waitlistRouter, usersRouter])
  .listen(envs.app.PORT, ({ port, hostname }) =>
    console.log(`Server running on port http://${hostname}:${port}`)
  );

export type App = typeof app;
