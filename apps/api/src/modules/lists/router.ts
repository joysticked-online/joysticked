import { Elysia, t } from 'elysia';
import { db } from '../../shared/database';
import { authMiddleware } from '../../shared/http/middlewares/auth';
import { databaseMiddleware } from '../../shared/http/middlewares/database';
import { addListGame, createList, deleteList, findList, listLists, removeListGame, toggleListLike, updateList } from './use-case';

const listInput = t.Object({ name: t.String({ minLength: 1, maxLength: 120 }), description: t.Optional(t.String({ maxLength: 300 })), isPublic: t.Optional(t.Boolean()), tags: t.Optional(t.Array(t.String({ maxLength: 40 }), { maxItems: 4 })) });
const gameInput = t.Record(t.String(), t.Unknown());

export const listsRouter = new Elysia({ prefix: '/lists', tags: ['lists'] }).use(databaseMiddleware).use(authMiddleware)
  .get('/', async ({ query, status }) => status(200, { lists: await listLists(db, query.username) }), { query: t.Object({ username: t.Optional(t.String({ minLength: 3, maxLength: 32 })) }) })
  .get('/:username/:slug', async ({ params, status }) => status(200, await findList(db, params.username, params.slug)), { params: t.Object({ username: t.String(), slug: t.String() }) })
  .post('/', async ({ body, userId, status }) => { if (!userId) return status(401, { message: 'Unauthorized' }); return status(201, await createList(db, userId, body)); }, { body: listInput })
  .patch('/:id', async ({ body, params, userId, status }) => { if (!userId) return status(401, { message: 'Unauthorized' }); return status(200, await updateList(db, userId, params.id, body)); }, { params: t.Object({ id: t.String({ format: 'uuid' }) }), body: listInput })
  .delete('/:id', async ({ params, userId, status }) => { if (!userId) return status(401, { message: 'Unauthorized' }); return status(200, await deleteList(db, userId, params.id)); }, { params: t.Object({ id: t.String({ format: 'uuid' }) }) })
  .post('/:id/games', async ({ body, params, userId, status }) => { if (!userId) return status(401, { message: 'Unauthorized' }); return status(200, await addListGame(db, userId, params.id, body)); }, { params: t.Object({ id: t.String({ format: 'uuid' }) }), body: gameInput })
  .delete('/:id/games/:gameId', async ({ params, userId, status }) => { if (!userId) return status(401, { message: 'Unauthorized' }); return status(200, await removeListGame(db, userId, params.id, params.gameId)); }, { params: t.Object({ id: t.String({ format: 'uuid' }), gameId: t.String() }) })
  .post('/:id/likes', async ({ params, userId, status }) => { if (!userId) return status(401, { message: 'Unauthorized' }); return status(200, await toggleListLike(db, userId, params.id)); }, { params: t.Object({ id: t.String({ format: 'uuid' }) }) });
