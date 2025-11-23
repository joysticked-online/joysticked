import { Elysia } from 'elysia';

import { checkEmailAvailabilityRouter } from './check-email-availability/router';
import { requestEmailValidationRouter } from './request-email-validation/router';
import { validateEmailOtpRouter } from './validate-email-otp/router';

export const usersRouter = new Elysia({ prefix: '/users', tags: ['user'] }).use([
  checkEmailAvailabilityRouter,
  requestEmailValidationRouter,
  validateEmailOtpRouter
]);
