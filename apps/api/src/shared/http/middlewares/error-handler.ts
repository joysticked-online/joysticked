import { Elysia } from 'elysia';
import { ConflictError } from '../../errors/conflict-error';
import { InternalServerError } from '../../errors/internal-server-error';

export const errorHandler = new Elysia({ name: 'error-handler' })
  .error({
    CONFLICT: ConflictError,
    INTERNAL_SERVER_ERROR: InternalServerError
  })
  .onError({ as: 'scoped' }, ({ error, code, status }) => {
    switch (code) {
      case 'CONFLICT': {
        return status(409, { code, message: error.message });
      }
      case 'INTERNAL_SERVER_ERROR': {
        return status(500, {
          code,
          message: error.message
        });
      }
      case 'VALIDATION': {
        const validationErrors: Record<string, string> = {};

        if (error.validator && 'path' in error.validator) {
          const path = error.validator.path.replace(/^\//, '');
          validationErrors[path] = error.validator.message;
        } else {
          validationErrors.general = error.message;
        }

        console.log(error);

        return status(422, {
          code,
          message: 'Validation Failed',
          error: validationErrors,
          status: error.status
        });
      }
      case 'NOT_FOUND': {
        return status(404, {
          code,
          message: 'Not Found',
          status: error.status
        });
      }
      default: {
        console.error(error);

        return status(500, {
          code,
          message: 'Internal Server Error'
        });
      }
    }
  });
