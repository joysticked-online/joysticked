import { Elysia } from 'elysia';

import { db } from '../../database';

export const databaseMiddleware = new Elysia({ name: 'database' }).derive({ as: 'scoped' }, () => {
  return {
    db
  };
});
