import { Elysia } from 'elysia';
import { envs } from '../config/envs';

const app = new Elysia().listen(envs.app.PORT, ({ port, hostname }) =>
  console.log(`Server running on port http://${hostname}:${port}`)
);

export type App = typeof app;
