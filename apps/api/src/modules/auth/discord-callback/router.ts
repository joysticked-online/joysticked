import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { discordOAuthCallbackQuerySchema } from './schemas';
import { discordOAuthCallbackUseCase } from './use-case';

export const discordOAuthCallbackRouter = new Elysia().use(databaseMiddleware).get(
  '/discord/callback',
  async ({ query, cookie, redirect, db }) => {
    const stateCookie =
      typeof cookie.discord_oauth_state?.value === 'string'
        ? cookie.discord_oauth_state.value
        : null;
    cookie.discord_oauth_state?.remove();

    if (!stateCookie || stateCookie !== query.state) {
      return redirect(`${envs.app.CLIENT_URL}/auth?error=invalid_state`, 302);
    }

    try {
      const result = await discordOAuthCallbackUseCase(db, query);

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

      return redirect(envs.app.CLIENT_URL, 302);
    } catch {
      return redirect(`${envs.app.CLIENT_URL}/auth?error=oauth_failed`, 302);
    }
  },
  {
    query: discordOAuthCallbackQuerySchema
  }
);
