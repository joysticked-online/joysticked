import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { createDevSocialSession } from '../dev-auth';
import { googleOAuthUseCase } from './use-case';

export const googleOAuthRouter = new Elysia().get('/google', async ({ redirect, cookie }) => {
  // If in dev mode and Google OAuth credentials are not configured or are placeholder:
  if (
    envs.app.NODE_ENV === 'dev' &&
    (!envs.auth.GOOGLE_CLIENT_ID ||
      envs.auth.GOOGLE_CLIENT_ID === 'your_google_client_id' ||
      !envs.auth.GOOGLE_CLIENT_SECRET ||
      envs.auth.GOOGLE_CLIENT_SECRET === 'your_google_client_secret')
  ) {
    const { sessionToken, user } = await createDevSocialSession('google');
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
    const { url } = await googleOAuthUseCase();
    return redirect(url, 302);
  } catch (err) {
    console.warn('[Google OAuth] Falling back to dev social session:', err);
    if (envs.app.NODE_ENV === 'dev') {
      const { sessionToken, user } = await createDevSocialSession('google');
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
