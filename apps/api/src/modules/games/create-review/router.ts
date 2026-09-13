import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';

import { db } from '../../../shared/database';
import { gameActivities, gameReviews, users } from '../../../shared/database/schemas';
import { executeTransaction } from '../../../shared/database/transaction';
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

      const { gameId, gameTitle, rating, reviewText, containsSpoiler, platform, hoursPlayed } =
        body;

      try {
        const review = await executeTransaction(db, async (tx) => {
          const [createdReview] = await tx
            .insert(gameReviews)
            .values({
              gameId: String(gameId),
              gameSlug: slug,
              gameTitle,
              userId,
              rating,
              reviewText: reviewText || null,
              containsSpoiler: containsSpoiler ?? false,
              platform: platform || null,
              hoursPlayed: hoursPlayed || null
            })
            .onConflictDoUpdate({
              target: [gameReviews.userId, gameReviews.gameId],
              set: {
                gameSlug: slug,
                gameTitle,
                rating,
                reviewText: reviewText || null,
                containsSpoiler: containsSpoiler ?? false,
                platform: platform || null,
                hoursPlayed: hoursPlayed || null,
                updatedAt: new Date()
              }
            })
            .returning();

          await tx.insert(gameActivities).values({
            gameId: String(gameId),
            gameSlug: slug,
            gameTitle,
            userId,
            type: 'rated',
            detail: reviewText
              ? `Avaliou com ${rating} estrelas: "${reviewText.substring(0, 80)}..."`
              : `Avaliou com ${rating} estrelas`,
            platform: platform || null
          });

          const [author] = await tx
            .select({
              id: users.id,
              username: users.username,
              displayName: users.displayName,
              avatarUrl: users.avatarUrl
            })
            .from(users)
            .where(eq(users.id, userId));

          return {
            ...createdReview,
            likesCount: 0,
            user: author
          };
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
        gameTitle: t.String({ maxLength: 200 }),
        rating: t.Number({ minimum: 1, maximum: 5 }),
        reviewText: t.Optional(t.String({ maxLength: 500 })),
        containsSpoiler: t.Optional(t.Boolean()),
        platform: t.Optional(t.String({ maxLength: 64 })),
        hoursPlayed: t.Optional(t.String({ maxLength: 32 }))
      })
    }
  )
  .delete(
    '/:slug/reviews/:reviewId',
    async ({ params, userId, set }) => {
      if (!userId) {
        set.status = 401;
        return { message: 'Você precisa estar logado para remover uma avaliação.' };
      }

      const [deletedReview] = await db
        .delete(gameReviews)
        .where(and(eq(gameReviews.id, params.reviewId), eq(gameReviews.userId, userId)))
        .returning({ id: gameReviews.id });

      if (!deletedReview) {
        set.status = 404;
        return { message: 'Avaliação não encontrada.' };
      }

      return { reviewId: deletedReview.id };
    },
    {
      params: t.Object({
        slug: t.String(),
        reviewId: t.String({ format: 'uuid' })
      })
    }
  );
