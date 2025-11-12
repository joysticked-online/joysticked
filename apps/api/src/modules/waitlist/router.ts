import { Elysia } from 'elysia';

import { getWaitlistRouter } from './get-count/router';
import { joinWaitlistRouter } from './join-waitlist/router';

export const waitlistRouter = new Elysia({ prefix: '/waitlist', tags: ['waitlist'] }).use([
  joinWaitlistRouter,
  getWaitlistRouter
]);
