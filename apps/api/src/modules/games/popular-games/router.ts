import { Elysia, t } from 'elysia';
import { db } from '../../../shared/database';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import {
  getDiscoverGames,
  getFeaturedAwaitedGame,
  getNewReleases,
  getPlatforms,
  getPopularGames,
  getPopularNewReleases,
  getTopRatedGames,
  getTopSellers,
  getUpcomingGames
} from './use-case';

export const popularGamesRouter = new Elysia()
  .use(authMiddleware)
  .get('/discover', ({ query, userId }) => getDiscoverGames(db, { ...query, userId }), {
    query: t.Object({
      limit: t.Optional(t.String()),
      offset: t.Optional(t.String()),
      played: t.Optional(t.String())
    })
  })
  .get('/popular', async ({ query }) => ({ games: await getPopularGames(query) }), {
    query: t.Object({ limit: t.Optional(t.String()), offset: t.Optional(t.String()) })
  })
  .get('/platforms', async ({ query }) => ({ platforms: await getPlatforms(query.limit) }), {
    query: t.Object({ limit: t.Optional(t.String()) })
  })
  .get('/top-rated', async ({ query }) => ({ games: await getTopRatedGames(query) }), {
    query: t.Object({ limit: t.Optional(t.String()), offset: t.Optional(t.String()) })
  })
  .get('/upcoming', async ({ query }) => ({ games: await getUpcomingGames(query.limit) }), {
    query: t.Object({ limit: t.Optional(t.String()) })
  })
  .get('/featured-awaited', async () => ({ game: await getFeaturedAwaitedGame() }))
  .get('/top-sellers', async ({ query }) => ({ games: await getTopSellers(query.limit) }), {
    query: t.Object({ limit: t.Optional(t.String()) })
  })
  .get(
    '/popular-new-releases',
    async ({ query }) => ({ games: await getPopularNewReleases(query) }),
    {
      query: t.Object({ limit: t.Optional(t.String()), offset: t.Optional(t.String()) })
    }
  )
  .get('/new-releases', async ({ query }) => ({ games: await getNewReleases(query.limit) }), {
    query: t.Object({ limit: t.Optional(t.String()) })
  });
