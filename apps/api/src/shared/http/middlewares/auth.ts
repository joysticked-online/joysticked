import { Elysia } from 'elysia';
import { getSession } from '../../providers/session';

/**
 * Auth middleware — reads the `session` cookie and derives the
 * current userId into route context.
 *
 * `userId` will be `null` if the request has no valid session.
 * Use this in routes that need to know who the user is, and throw
 * `UnauthorizedError` if `userId` is null and the route requires auth.
 */
export const authMiddleware = new Elysia({ name: 'auth' }).derive(
  { as: 'scoped' },
  async ({ cookie, headers }) => {
    let sessionToken =
      typeof cookie.session?.value === 'string' && cookie.session.value.length > 0
        ? cookie.session.value
        : null;

    if (!sessionToken) {
      return { userId: null as string | null };
    }

    const userId = await getSession(sessionToken);

    return { userId };
  }
);
