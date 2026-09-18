import { Elysia } from 'elysia';
import { discordOAuthRouter } from './discord/router';
import { discordOAuthCallbackRouter } from './discord-callback/router';
import { emailValidationRouter } from './email-validation/router';
import { googleOAuthRouter } from './google/router';
import { googleOAuthCallbackRouter } from './google-callback/router';
import { logoutRouter } from './logout/router';
import { requestMagicLinkRouter } from './magic-link/router';
import { meRouter } from './me/router';
import { verifyMagicLinkRouter } from './verify/router';

export const authRouter = new Elysia({ prefix: '/auth', tags: ['auth'] })
  .use(requestMagicLinkRouter)
  .use(emailValidationRouter)
  .use(verifyMagicLinkRouter)
  .use(googleOAuthRouter)
  .use(googleOAuthCallbackRouter)
  .use(discordOAuthRouter)
  .use(discordOAuthCallbackRouter)
  .use(logoutRouter)
  .use(meRouter);
