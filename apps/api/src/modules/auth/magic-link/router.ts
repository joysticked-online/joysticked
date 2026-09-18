import { fixedWindow } from 'bunlimit';
import { Elysia } from 'elysia';
import { rateLimitMiddleware } from '../../../shared/http/middlewares/rate-limitter';
import { requestMagicLinkBodySchema, requestMagicLinkSuccessResponseSchema } from './schemas';
import { requestMagicLinkUseCase } from './use-case';

export const requestMagicLinkRouter = new Elysia()
  .use(
    rateLimitMiddleware({
      strategy: fixedWindow(5, 600),
      key: 'magic-link',
      failureMode: 'closed'
    })
  )
  .post(
    '/magic-link',
    async ({ body, status }) => {
      const response = await requestMagicLinkUseCase({ email: body.email });
      return status(200, response);
    },
    {
      body: requestMagicLinkBodySchema,
      response: {
        200: requestMagicLinkSuccessResponseSchema
      }
    }
  );
