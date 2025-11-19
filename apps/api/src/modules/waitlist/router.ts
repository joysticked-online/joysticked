import { Elysia } from 'elysia';

import { getWaitlistRouter } from './get-count/router';
import { getWaitlistJoinDateRouter } from './get-waitlist-join-date/router';
import { joinWaitlistRouter } from './join-waitlist/router';
import { unsubscribeWaitlistRouter } from './unsubscribe-waitlist/router';

export const waitlistRouter = new Elysia({ prefix: '/waitlist', tags: ['waitlist'] }).use([
  joinWaitlistRouter,
  getWaitlistRouter,
  getWaitlistJoinDateRouter,
  unsubscribeWaitlistRouter
]);
