import Elysia from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import {
  checkEmailAvailabilityBodySchema,
  checkEmailAvailabilityConflictResponseSchema,
  checkEmailAvailabilitySuccessResponseSchema
} from './schemas';
import { checkEmailAvailability } from './use-case';

export const checkEmailAvailabilityRouter = new Elysia().use(databaseMiddleware).post(
  '/emails/check-availability',
  async ({ db, body, status }) => {
    const isEmailAvailable = await checkEmailAvailability(db, {
      email: body.email
    });

    return status(200, { available: isEmailAvailable });
  },
  {
    body: checkEmailAvailabilityBodySchema,
    response: {
      200: checkEmailAvailabilitySuccessResponseSchema,
      409: checkEmailAvailabilityConflictResponseSchema
    }
  }
);
