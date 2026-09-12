import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { createDevSocialSession } from '../dev-auth';
import { discordOAuthUseCase } from './use-case';

export const discordOAuthRouter = new Elysia().get('/discord', async ({ redirect, cookie }) => {
  // If in dev mode and Discord OAuth credentials are not configured or are placeholder:
  if (
    envs.app.NODE_ENV === 'dev' &&
    (!envs.auth.DISCORD_CLIENT_ID ||
      envs.auth.DISCORD_CLIENT_ID === 'your_discord_client_id' ||
      !envs.auth.DISCORD_CLIENT_SECRET ||
      envs.auth.DISCORD_CLIENT_SECRET === 'your_discord_client_secret')
  ) {
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

  try {
    const { url } = await discordOAuthUseCase();
    return redirect(url, 302);
  } catch (err) {
    console.warn('[Discord OAuth] Falling back to dev social session:', err);
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
});
