import { Elysia } from 'elysia';
import { envs } from '../../../shared/config/envs';
import { discordOAuthUseCase } from './use-case';

export const discordOAuthRouter = new Elysia().get('/discord', async ({ cookie, redirect }) => {
  const { state, url } = await discordOAuthUseCase();
  cookie.discord_oauth_state.set({
    value: state,
    httpOnly: true,
    secure: envs.app.NODE_ENV === 'prod',
    sameSite: 'lax',
    path: '/auth/discord',
    maxAge: 60 * 10
  });
  return redirect(url, 302);
});
