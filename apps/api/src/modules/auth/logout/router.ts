import { Elysia } from 'elysia';
import { logoutUseCase } from './use-case';

export const logoutRouter = new Elysia().post('/logout', async ({ cookie, status }) => {
  const token = typeof cookie.session?.value === 'string' ? cookie.session.value : null;
  const response = await logoutUseCase(token);
  cookie.session.remove();
  return status(200, response);
});
