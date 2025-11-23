import Elysia from 'elysia';

import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import {
  validateEmailBadRequestResponseSchema,
  validateEmailConflictErrorSchema,
  validateEmailNotFoundReponseSchema,
  validateEmailOtpBodySchema,
  validateEmailOtpSuccessResponseSchema
} from './schemas';
import { validateEmailOtpUseCase } from './use-case';

export const validateEmailOtpRouter = new Elysia().use(databaseMiddleware).post(
  '/validations/email',
  async ({ db, body, status }) => {
    const validation = await validateEmailOtpUseCase(db, {
      validateEmailRequestId: body.validateEmailRequestId,
      otp: body.otp
    });

    return status(200, { requestId: validation });
  },
  {
    body: validateEmailOtpBodySchema,
    response: {
      200: validateEmailOtpSuccessResponseSchema,
      400: validateEmailBadRequestResponseSchema,
      404: validateEmailNotFoundReponseSchema,
      409: validateEmailConflictErrorSchema
    }
  }
);
