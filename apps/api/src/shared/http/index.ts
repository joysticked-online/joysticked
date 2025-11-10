import { Elysia } from 'elysia';

import { waitlistRouter } from '../../modules/waitlist/router';
import { envs } from '../config/envs';

const app = new Elysia()
  .use([waitlistRouter])
  .listen(envs.app.PORT, ({ port, hostname }) =>
    console.log(`Server running on port http://${hostname}:${port}`)
  );

export type App = typeof app;
