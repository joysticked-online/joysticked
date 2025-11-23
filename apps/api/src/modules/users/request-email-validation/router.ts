import Elysia from 'elysia';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import {
  requestEmailValidationBodySchema,
  requestEmailValidationConflictErrorResponseSchema,
  requestEmailValidationSuccessResponseSchema
} from './schemas';
import { requestEmailValidationUseCase } from './use-case';

export const requestEmailValidationRouter = new Elysia().use(databaseMiddleware).post(
  '/emails/request-validation',
  async ({ db, body, status }) => {
    const requestId = await requestEmailValidationUseCase(db, {
      email: body.email
    });

    return status(201, { requestId });
  },
  {
    body: requestEmailValidationBodySchema,
    response: {
      201: requestEmailValidationSuccessResponseSchema,
      409: requestEmailValidationConflictErrorResponseSchema
    }
  }
);
