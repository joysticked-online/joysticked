import { Elysia } from 'elysia';
import { ConflictError } from '../../errors/conflict-error';
import { InternalServerError } from '../../errors/internal-server-error';
import { RateLimitError } from '../../errors/rate-limit-error';
import { ResourceNotFoundError } from '../../errors/resource-not-found-error';

export const errorHandler = new Elysia({ name: 'error-handler' })
  .error({
    CONFLICT: ConflictError,
    INTERNAL_SERVER_ERROR: InternalServerError,
    RATE_LIMIT_EXCEEDED: RateLimitError,
    RESOURCE_NOT_FOUND: ResourceNotFoundError
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
      case 'RATE_LIMIT_EXCEEDED': {
        return status(429, {
          code,
          message: error.message
        });
      }
      case 'RESOURCE_NOT_FOUND': {
        return status(404, {
          code,
          message: error.message
        });
      }
      case 'VALIDATION': {
        const validationErrors: Record<string, string> = {};

        // Parse the error message if it's a stringified JSON
        type ValidationErrorDetails = {
          errors?: Array<{
            path?: string[];
            message: string;
          }>;
          message?: string;
        };

        let errorDetails: ValidationErrorDetails;
        try {
          errorDetails = typeof error.message === 'string' ? JSON.parse(error.message) : error;
        } catch {
          errorDetails = error;
        }

        // Handle ElysiaJS validation errors with array of errors
        if (errorDetails?.errors && Array.isArray(errorDetails.errors)) {
          for (const validationError of errorDetails.errors) {
            if (validationError.path && Array.isArray(validationError.path)) {
              const fieldPath = validationError.path.join('.');
              validationErrors[fieldPath] = validationError.message;
            }
          }
        }

        // Handle single validator error
        if (error.validator && 'path' in error.validator) {
          const path = error.validator.path.replace(/^\//, '');
          validationErrors[path] = error.validator.message;
        }

        // Fallback to general error if no specific errors were found
        if (Object.keys(validationErrors).length === 0) {
          validationErrors.general = errorDetails?.message || error.message;
        }

        console.error('Validation error:', errorDetails);

        return status(422, {
          code,
          message: 'Validation Failed',
          errors: validationErrors
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
