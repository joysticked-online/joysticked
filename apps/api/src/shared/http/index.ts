import { logger } from '@bogeychan/elysia-logger';
import cors from '@elysiajs/cors';
import openapi from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { z } from 'zod';

import { authRouter } from '../../modules/auth/router';
import { gamesRouter } from '../../modules/games/router';
import { profileRouter } from '../../modules/profile/router';
import { waitlistRouter } from '../../modules/waitlist/router';
import { envs } from '../config/envs';
import { healthCheck } from './health-check';
import { errorHandler } from './middlewares/error-handler';

const app = new Elysia()
  .use(cors())
  .use(
    logger({
      level: 'info'
    })
  )
  .use(errorHandler)
  .use(healthCheck)

  .use(
    openapi({
      path: '/swagger',
      mapJsonSchema: {
        zod: z.toJSONSchema
      }
    })
  )
  .use(waitlistRouter)
  .use(profileRouter)
  .use(authRouter)
  .use(gamesRouter)
  .listen(envs.app.PORT, ({ port, hostname }) =>
    console.log(`Server running on port http://${hostname}:${port}`)
  );

export type App = typeof app;
