import { Elysia } from 'elysia';

import { db } from '@/shared/database';

export const databaseMiddleware = new Elysia({ name: 'database' }).derive({ as: 'scoped' }, () => {
  return {
    db
  };
});
