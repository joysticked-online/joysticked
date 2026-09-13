import { fixedWindow } from 'bunlimit';
import { desc, eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../../shared/database';
import { gameActivities } from '../../shared/database/schemas/game-activities';
import { gameReviews } from '../../shared/database/schemas/game-reviews';
import { users } from '../../shared/database/schemas/users';
import { rateLimitMiddleware } from '../../shared/http/middlewares/rate-limitter';
import { igdbProvider } from '../../shared/providers/igdb/igdb-provider';
import { steamService } from '../../shared/providers/steam/steam-service';

const HOME_CACHE_TTL_MS = 30_000;
let homeCache: { expiresAt: number; value: object } | null = null;

export const homeRouter = new Elysia()
  .use(rateLimitMiddleware({ strategy: fixedWindow(60, 60), key: 'home' }))
  .get('/home', async () => {
    if (homeCache && homeCache.expiresAt > Date.now()) return homeCache.value;

    // 1. Fetch sidebar data independently so one provider failure does not break the homepage
    const [popularResult, topRatedResult, steamAwaitedResult] = await Promise.allSettled([
      igdbProvider.getPopularGames(3),
      igdbProvider.getTopRatedGames(3),
      steamService.getMostAwaitedGames(3)
    ]);

    const popularGames = popularResult.status === 'fulfilled' ? popularResult.value : [];
    const topRatedGames = topRatedResult.status === 'fulfilled' ? topRatedResult.value : [];

    let upcomingGames = steamAwaitedResult.status === 'fulfilled' ? steamAwaitedResult.value : [];

    if (!upcomingGames || upcomingGames.length === 0) {
      upcomingGames = await igdbProvider.getUpcomingGames(3).catch((err) => {
        console.warn('Could not fetch upcoming games:', err);
        return [];
      });
    }

    // 2. Fetch community reviews
    let popularReviews: Array<{
      id: string;
      gameId: string;
      gameSlug: string;
      gameTitle: string;
      rating: number;
      reviewText: string | null;
      platform: string | null;
      hoursPlayed: string | null;
      createdAt: Date;
      userId: string;
      likesCount: number;
      user: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }> = [];

    try {
      const dbReviews = await db
        .select({
          id: gameReviews.id,
          gameId: gameReviews.gameId,
          gameSlug: gameReviews.gameSlug,
          gameTitle: gameReviews.gameTitle,
          rating: gameReviews.rating,
          reviewText: gameReviews.reviewText,
          platform: gameReviews.platform,
          hoursPlayed: gameReviews.hoursPlayed,
          createdAt: gameReviews.createdAt,
          userId: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        })
        .from(gameReviews)
        .innerJoin(users, eq(gameReviews.userId, users.id))
        .orderBy(desc(gameReviews.createdAt))
        .limit(10);

      popularReviews = dbReviews.map((r) => ({
        id: r.id,
        gameId: r.gameId,
        gameSlug: r.gameSlug,
        gameTitle: r.gameTitle,
        rating: r.rating,
        reviewText: r.reviewText,
        platform: r.platform,
        hoursPlayed: r.hoursPlayed,
        createdAt: r.createdAt,
        userId: r.userId,
        likesCount: 0,
        user: {
          id: r.userId,
          username: r.username,
          displayName: r.displayName,
          avatarUrl: r.avatarUrl
        }
      }));
    } catch (err) {
      console.warn('Could not fetch home reviews:', err);
    }

    // 3. Fetch community activities
    let activities: Array<{
      id: string;
      gameSlug: string;
      type: string;
      detail: string | null;
      platform: string | null;
      createdAt: Date;
      gameId: string;
      gameTitle: string;
      userId: string;
      user: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }> = [];

    try {
      const dbActivities = await db
        .select({
          id: gameActivities.id,
          gameId: gameActivities.gameId,
          gameSlug: gameActivities.gameSlug,
          gameTitle: gameActivities.gameTitle,
          type: gameActivities.type,
          detail: gameActivities.detail,
          platform: gameActivities.platform,
          createdAt: gameActivities.createdAt,
          userId: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl
        })
        .from(gameActivities)
        .innerJoin(users, eq(gameActivities.userId, users.id))
        .orderBy(desc(gameActivities.createdAt))
        .limit(10);

      activities = dbActivities.map((a) => ({
        id: a.id,
        gameId: a.gameId,
        gameSlug: a.gameSlug,
        gameTitle: a.gameTitle,
        type: a.type,
        detail: a.detail,
        platform: a.platform,
        createdAt: a.createdAt,
        userId: a.userId,
        user: {
          id: a.userId,
          username: a.username,
          displayName: a.displayName,
          avatarUrl: a.avatarUrl
        }
      }));
    } catch (err) {
      console.warn('Could not fetch home activities:', err);
    }

    const value = {
      popularGames,
      topRatedGames,
      upcomingGames,
      popularReviews,
      activities
    };

    homeCache = { value, expiresAt: Date.now() + HOME_CACHE_TTL_MS };
    return value;
  });
