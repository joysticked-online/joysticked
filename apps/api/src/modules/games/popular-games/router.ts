import { and, eq, inArray } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { db } from '../../../shared/database';
import { gameActivities } from '../../../shared/database/schemas';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';
import { steamService } from '../../../shared/providers/steam/steam-service';

export const popularGamesRouter = new Elysia()
  .get(
    '/discover',
    async ({ query }) => {
      const limit = query.limit ? Number(query.limit) : 21;
      const offset = query.offset ? Number(query.offset) : 0;
      const played = query.played
        ? query.played
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const userId = query.userId;

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
        played: t.Optional(t.String()),
        userId: t.Optional(t.String())
      })
    }
  )
  .get(
    '/popular',
    async ({ query }) => {
      const limit = query.limit ? Number(query.limit) : 21;
      const offset = query.offset ? Number(query.offset) : 0;
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
      const limit = query.limit ? Number(query.limit) : 18;
      const offset = query.offset ? Number(query.offset) : 0;
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
      const limit = query.limit ? Number(query.limit) : 18;
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
      const limit = query.limit ? Number(query.limit) : 18;
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
      const limit = query.limit ? Number(query.limit) : 18;
      const offset = query.offset ? Number(query.offset) : 0;
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
      const limit = query.limit ? Number(query.limit) : 18;
      const games = await steamService.getPopularNewReleases(limit);
      return { games };
    },
    {
      query: t.Object({
        limit: t.Optional(t.String())
      })
    }
  );
