import { Elysia } from 'elysia';
import { googleOAuthUseCase } from './use-case';

export const googleOAuthRouter = new Elysia().get('/google', async ({ redirect }) => {
  const { url } = await googleOAuthUseCase();
  return redirect(url, 302);
});
