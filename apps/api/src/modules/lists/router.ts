import { and, desc, eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { z } from 'zod';
import { userLists } from '../../shared/database/schemas/user-lists';
import { users } from '../../shared/database/schemas/users';
import { authMiddleware } from '../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../shared/http/middlewares/database';

const listBody = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  games: z.array(z.unknown()).max(500).default([])
});

const slugify = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'lista';

export const listsRouter = new Elysia({ prefix: '/lists', tags: ['lists'] })
  .use(databaseMiddleware)
  .use(authMiddleware)
  .get('/u/:username', async ({ params, db, status }) => {
    const owner = await db.select().from(users).where(eq(users.username, params.username)).limit(1);
    if (!owner[0]) return status(404, { message: 'User not found' });
    const rows = await db
      .select()
      .from(userLists)
      .where(and(eq(userLists.userId, owner[0].id), eq(userLists.isPublic, true)))
      .orderBy(desc(userLists.updatedAt));
    return status(200, rows);
  })
  .post('/', async ({ body, db, userId, status }) => {
    if (!userId) return status(401, { message: 'Authentication required' });
    const [created] = await db
      .insert(userLists)
      .values({ ...body, slug: `${slugify(body.name)}-${Date.now().toString(36)}`, userId })
      .returning();
    return status(201, created);
  }, { body: listBody })
  .patch('/:id', async ({ params, body, db, userId, status }) => {
    if (!userId) return status(401, { message: 'Authentication required' });
    const [updated] = await db
      .update(userLists)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(userLists.id, params.id), eq(userLists.userId, userId)))
      .returning();
    if (!updated) return status(404, { message: 'List not found' });
    return status(200, updated);
  }, { body: listBody })
  .delete('/:id', async ({ params, db, userId, status }) => {
    if (!userId) return status(401, { message: 'Authentication required' });
    const deleted = await db
      .delete(userLists)
      .where(and(eq(userLists.id, params.id), eq(userLists.userId, userId)))
      .returning({ id: userLists.id });
    if (!deleted[0]) return status(404, { message: 'List not found' });
    return status(204);
  });
