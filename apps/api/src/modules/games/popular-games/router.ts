import { and, eq, inArray } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { db } from '../../../shared/database';
import { gameActivities } from '../../../shared/database/schemas';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';
import { steamService } from '../../../shared/providers/steam/steam-service';

function parsePaginationValue(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 0), max);
}

export const popularGamesRouter = new Elysia()
  .use(authMiddleware)
  .get(
    '/discover',
    async ({ query, userId }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 21, 100), 1);
      const offset = parsePaginationValue(query.offset, 0, 10_000);
      const played = query.played
        ? query.played
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      let allPlayedSlugs = [...played];
      if (userId) {
        try {
          const acts = await db
            .select({ slug: gameActivities.gameSlug })
            .from(gameActivities)
            .where(
              and(
                eq(gameActivities.userId, userId),
                inArray(gameActivities.type, ['played', 'completed', 'rated'])
              )
            )
            .limit(20);
          const dbSlugs = acts.map((a) => a.slug);
          allPlayedSlugs = Array.from(new Set([...allPlayedSlugs, ...dbSlugs]));
        } catch {}
      }

      const result = await igdbProvider.getPersonalizedDiscoverGames({
        playedSlugs: allPlayedSlugs,
        limit,
        offset
      });

      return result;
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        played: t.Optional(t.String())
      })
    }
  )
  .get(
    '/popular',
    async ({ query }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 21, 100), 1);
      const offset = parsePaginationValue(query.offset, 0, 10_000);
      const games = await igdbProvider.getPopularGames(limit + offset);
      return { games: games.slice(offset, offset + limit) };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String())
      })
    }
  )
  .get(
    '/top-rated',
    async ({ query }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 18, 100), 1);
      const offset = parsePaginationValue(query.offset, 0, 10_000);
      const games = await igdbProvider.getTopRatedGames(limit + offset);
      return { games: games.slice(offset, offset + limit) };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String())
      })
    }
  )
  .get(
    '/upcoming',
    async ({ query }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 18, 100), 1);
      let games = await steamService.getMostAwaitedGames(limit);
      if (!games || games.length === 0) {
        games = await igdbProvider.getUpcomingGames(limit);
      }
      return { games };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String())
      })
    }
  )
  .get('/featured-awaited', async () => {
    const games = await steamService.getMostAwaitedGames(3);
    return { game: games[0] || null };
  })
  .get(
    '/top-sellers',
    async ({ query }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 18, 100), 1);
      const games = await steamService.getTopSellers(limit);
      return { games };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String())
      })
    }
  )
  .get(
    '/popular-new-releases',
    async ({ query }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 18, 100), 1);
      const offset = parsePaginationValue(query.offset, 0, 10_000);
      const games = await steamService.getPopularNewReleases(limit + offset);
      return { games: games.slice(offset, offset + limit) };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String())
      })
    }
  )
  .get(
    '/new-releases',
    async ({ query }) => {
      const limit = Math.max(parsePaginationValue(query.limit, 18, 100), 1);
      const games = await steamService.getPopularNewReleases(limit);
      return { games };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String())
      })
    }
  );
