import { Elysia } from 'elysia';
import { discordOAuthUseCase } from './use-case';

export const discordOAuthRouter = new Elysia().get('/discord', async ({ redirect }) => {
  const { url } = await discordOAuthUseCase();
  return redirect(url, 302);
});
