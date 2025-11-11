import { Elysia } from 'elysia';
import { joinWaitlistRouter } from './join-waitlist/router';

export const waitlistRouter = new Elysia({ prefix: '/waitlist', tags: ['waitlist'] }).use([
  joinWaitlistRouter
]);
