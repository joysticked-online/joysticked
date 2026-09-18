import { desc, eq } from 'drizzle-orm';
import { db } from '../../../shared/database';
import { gameActivities, gameReviews, users } from '../../../shared/database/schemas';

export async function getGameReviews(gameSlug: string) {
  try {
    const rows = await db
      .select({
        id: gameReviews.id,
        rating: gameReviews.rating,
        reviewText: gameReviews.reviewText,
        containsSpoiler: gameReviews.containsSpoiler,
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
      .where(eq(gameReviews.gameSlug, gameSlug))
      .orderBy(desc(gameReviews.createdAt))
      .limit(20);

    return rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      reviewText: row.reviewText,
      containsSpoiler: row.containsSpoiler,
      platform: row.platform,
      hoursPlayed: row.hoursPlayed,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        username: row.username,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl
      }
    }));
  } catch (error) {
    console.warn('Could not fetch game reviews:', error);
    return [];
  }
}

export async function getGameActivities(gameSlug: string) {
  try {
    const rows = await db
      .select({
        id: gameActivities.id,
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
      .where(eq(gameActivities.gameSlug, gameSlug))
      .orderBy(desc(gameActivities.createdAt))
      .limit(20);

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      detail: row.detail,
      platform: row.platform,
      createdAt: row.createdAt,
      user: {
        id: row.userId,
        username: row.username,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl
      }
    }));
  } catch (error) {
    console.warn('Could not fetch game activities:', error);
    return [];
  }
}
