import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { verifyMagicLinkQuerySchema } from './schemas';
import { verifyMagicLinkUseCase } from './use-case';

export const verifyMagicLinkRouter = new Elysia().use(databaseMiddleware).get(
  '/verify',
  async ({ query, cookie, redirect, db }) => {
    const result = await verifyMagicLinkUseCase(db, { token: query.token });

    if (!result) {
      return redirect(`${envs.app.CLIENT_URL}/auth?error=invalid_token`, 302);
    }

    cookie.session.set({
      value: result.sessionToken,
      httpOnly: true,
      secure: envs.app.NODE_ENV === 'prod',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return redirect(envs.app.CLIENT_URL, 302);
  },
  {
    query: verifyMagicLinkQuerySchema
  }
);
