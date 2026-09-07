import { desc, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';

import { db } from '../../../shared/database';
import { gameActivities, gameReviews, users } from '../../../shared/database/schemas';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';

export const getGameRouter = new Elysia().get(
  '/:slug',
  async ({ params, set }) => {
    const { slug } = params;
    const game = await igdbProvider.getGameBySlugOrId(slug);

    if (!game) {
      set.status = 404;
      return { message: 'Jogo não encontrado.' };
    }

    // Fetch community reviews from database
    let reviews: {
      id: string;
      rating: number;
      reviewText: string | null;
      platform: string | null;
      hoursPlayed: string | null;
      createdAt: Date;
      user: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }[] = [];

    try {
      const dbReviews = await db
        .select({
          id: gameReviews.id,
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
        .where(eq(gameReviews.gameSlug, game.slug))
        .orderBy(desc(gameReviews.createdAt))
        .limit(20);

      reviews = dbReviews.map((r) => ({
        id: r.id,
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
      console.warn('Could not fetch reviews from db:', err);
    }

    // Fetch community activities for this game
    let activities: {
      id: string;
      type: string;
      detail: string | null;
      platform: string | null;
      createdAt: Date;
      user: {
        id: string;
        username: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }[] = [];

    try {
      const dbActivities = await db
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
        .where(eq(gameActivities.gameSlug, game.slug))
        .orderBy(desc(gameActivities.createdAt))
        .limit(20);

      activities = dbActivities.map((a) => ({
        id: a.id,
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
      console.warn('Could not fetch activities from db:', err);
    }

    const similarGames = game.similarGames || [];
    const recommendedGames = await igdbProvider.getRecommendedGames(game, 8);

    return {
      game,
      reviews,
      activities,
      similarGames,
      recommendedGames
    };
  },
  {
    params: t.Object({
      slug: t.String()
    })
  }
);
