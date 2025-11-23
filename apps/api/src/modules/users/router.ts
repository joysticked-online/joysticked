import { Elysia } from 'elysia';
import { checkEmailAvailabilityRouter } from './check-email-availability/router';

export const usersRouter = new Elysia({ prefix: '/users', tags: ['user'] }).use([
  checkEmailAvailabilityRouter
]);
