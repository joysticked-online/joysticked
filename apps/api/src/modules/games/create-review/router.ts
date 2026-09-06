import { Elysia, t } from 'elysia';

import { db } from '../../../shared/database';
import { gameActivities, gameReviews } from '../../../shared/database/schemas';
import { authMiddleware } from '../../../shared/http/middlewares/auth';

export const createReviewRouter = new Elysia()
  .use(authMiddleware)
  .post(
    '/:slug/reviews',
    async ({ params, body, userId, set }) => {
      const { slug } = params;

      if (!userId) {
        set.status = 401;
        return { message: 'Você precisa estar logado para avaliar.' };
      }

    const { gameId, gameTitle, rating, reviewText, platform, hoursPlayed } = body;

    try {
      const [review] = await db
        .insert(gameReviews)
        .values({
          gameId: String(gameId),
          gameSlug: slug,
          gameTitle,
          userId,
          rating,
          reviewText: reviewText || null,
          platform: platform || null,
          hoursPlayed: hoursPlayed || null
        })
        .returning();

      // Log to game activity
      await db.insert(gameActivities).values({
        gameId: String(gameId),
        gameSlug: slug,
        gameTitle,
        userId,
        type: 'rated',
        detail: reviewText ? `Avaliou com ${rating} estrelas: "${reviewText.substring(0, 80)}..."` : `Avaliou com ${rating} estrelas`,
        platform: platform || null
      });

      return { review };
    } catch (err) {
      console.error('Failed to create review:', err);
      set.status = 500;
      return { message: 'Erro ao salvar avaliação.' };
    }
  },
  {
    params: t.Object({
      slug: t.String()
    }),
    body: t.Object({
      gameId: t.Union([t.String(), t.Number()]),
      gameTitle: t.String(),
      rating: t.Number({ minimum: 1, maximum: 5 }),
      reviewText: t.Optional(t.String()),
      platform: t.Optional(t.String()),
      hoursPlayed: t.Optional(t.String())
    })
  }
);
