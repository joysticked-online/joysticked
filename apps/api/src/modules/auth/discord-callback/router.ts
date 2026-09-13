import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { databaseMiddleware } from '../../../shared/http/middlewares/database';
import { createDevSocialSession } from '../dev-auth';
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
        if (envs.app.NODE_ENV === 'dev') {
          const { sessionToken, user } = await createDevSocialSession('discord');
          cookie.session.set({
            value: sessionToken,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30
          });
          const targetUrl = new URL(`${envs.app.CLIENT_URL}/auth/callback`);
          targetUrl.searchParams.set('token', sessionToken);
          targetUrl.searchParams.set('user', JSON.stringify(user));
          return redirect(targetUrl.toString(), 302);
        }
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

      const targetUrl = new URL(`${envs.app.CLIENT_URL}/auth/callback`);
      targetUrl.searchParams.set('token', result.sessionToken);
      if (result.user) {
        targetUrl.searchParams.set('user', JSON.stringify(result.user));
      }
      return redirect(targetUrl.toString(), 302);
    } catch (err) {
      console.error('[Discord OAuth Callback Error]:', err);
      if (envs.app.NODE_ENV === 'dev') {
        const { sessionToken, user } = await createDevSocialSession('discord');
        cookie.session.set({
          value: sessionToken,
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30
        });
        const targetUrl = new URL(`${envs.app.CLIENT_URL}/auth/callback`);
        targetUrl.searchParams.set('token', sessionToken);
        targetUrl.searchParams.set('user', JSON.stringify(user));
        return redirect(targetUrl.toString(), 302);
      }
      return redirect(`${envs.app.CLIENT_URL}/auth?error=oauth_failed`, 302);
    }
  },
  {
    query: discordOAuthCallbackQuerySchema
  }
);
