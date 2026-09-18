import { desc, eq } from 'drizzle-orm';
import { db } from '../../shared/database';
import { gameActivities } from '../../shared/database/schemas/game-activities';
import { gameReviews } from '../../shared/database/schemas/game-reviews';
import { users } from '../../shared/database/schemas/users';

export async function getPopularReviews() {
  try {
    const rows = await db
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

    return rows.map((row) => ({
      ...row,
      likesCount: 0,
      user: {
        id: row.userId,
        username: row.username,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl
      }
    }));
  } catch (error) {
    console.warn('Could not fetch home reviews:', error);
    return [];
  }
}

export async function getRecentActivities() {
  try {
    const rows = await db
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

    return rows.map((row) => ({
      ...row,
      user: {
        id: row.userId,
        username: row.username,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl
      }
    }));
  } catch (error) {
    console.warn('Could not fetch home activities:', error);
    return [];
  }
}
