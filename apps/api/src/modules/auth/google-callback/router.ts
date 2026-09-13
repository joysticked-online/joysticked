import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { googleOAuthCallbackQuerySchema } from './schemas';
import { googleOAuthCallbackUseCase } from './use-case';

export const googleOAuthCallbackRouter = new Elysia().use(databaseMiddleware).get(
  '/google/callback',
  async ({ query, cookie, redirect, db }) => {
    const stateCookie =
      typeof cookie.google_oauth_state?.value === 'string' ? cookie.google_oauth_state.value : null;
    cookie.google_oauth_state?.remove();

    if (!stateCookie || stateCookie !== query.state) {
      return redirect(`${envs.app.CLIENT_URL}/auth?error=invalid_state`, 302);
    }

    try {
      const result = await googleOAuthCallbackUseCase(db, query);

      if (!result) {
        return redirect(`${envs.app.CLIENT_URL}/auth?error=invalid_state`, 302);
      }

      cookie.session.set({
        value: result.sessionToken,
        httpOnly: true,
        secure: envs.app.NODE_ENV === 'prod',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });

      return redirect(`${envs.app.CLIENT_URL}/home`, 302);
    } catch (err) {
      console.error('[Google OAuth Callback Error]:', err);
      return redirect(`${envs.app.CLIENT_URL}/auth?error=oauth_failed`, 302);
    }
  },
  {
    query: googleOAuthCallbackQuerySchema
  }
);
