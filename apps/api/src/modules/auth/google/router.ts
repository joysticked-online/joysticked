import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { googleOAuthUseCase } from './use-case';

export const googleOAuthRouter = new Elysia().get('/google', async ({ cookie, redirect }) => {
  const { state, url } = await googleOAuthUseCase();
  cookie.google_oauth_state.set({
    value: state,
    httpOnly: true,
    secure: envs.app.NODE_ENV === 'prod',
    sameSite: 'lax',
    path: '/auth/google',
    maxAge: 60 * 10
  });
  return redirect(url, 302);
});
