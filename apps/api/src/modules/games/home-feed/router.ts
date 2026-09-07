import { desc, eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../../../shared/database';
import { gameActivities } from '../../../shared/database/schemas/game-activities';
import { gameReviews } from '../../../shared/database/schemas/game-reviews';
import { users } from '../../../shared/database/schemas/users';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';

export const homeFeedRouter = new Elysia().get('/home-feed', async () => {
  // 1. Fetch 3 popular games, 3 top rated games, and 3 upcoming games for sidebar
  const [popularGames, topRatedGames, upcomingGames] = await Promise.all([
    igdbProvider.getPopularGames(3),
    igdbProvider.getTopRatedGames(3),
    igdbProvider.getUpcomingGames(3)
  ]);

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
    user: {
      id: string;
      username: string;
      displayName: string;
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
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  }> = [];

  try {
    const dbActivities = await db
      .select({
        id: gameActivities.id,
        gameSlug: gameActivities.gameSlug,
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
      gameSlug: a.gameSlug,
      type: a.type,
      detail: a.detail,
      platform: a.platform,
      createdAt: a.createdAt,
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

  return {
    popularGames,
    topRatedGames,
    upcomingGames,
    popularReviews,
    activities
  };
});
