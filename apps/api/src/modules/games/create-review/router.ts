import { Elysia, t } from 'elysia';
import { db } from '../../../shared/database';
import { authMiddleware } from '../../../shared/http/middlewares/auth';
import { createReviewUseCase, deleteReviewUseCase } from './use-case';

export const createReviewRouter = new Elysia()
  .use(authMiddleware)
  .post(
    '/:slug/reviews',
    async ({ params, body, userId, set }) => {
      if (!userId) {
        set.status = 401;
        return { message: 'Você precisa estar logado para avaliar.' };
      }

      try {
        return await createReviewUseCase(db, { ...params, ...body, userId });
      } catch (error) {
        console.error('Failed to create review:', error);
        set.status = 500;
        return { message: 'Erro ao salvar avaliação.' };
      }
    },
    {
      params: t.Object({ slug: t.String() }),
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

      const reviewId = await deleteReviewUseCase(db, { reviewId: params.reviewId, userId });
      if (!reviewId) {
        set.status = 404;
        return { message: 'Avaliação não encontrada.' };
      }

      return { reviewId };
    },
    {
      params: t.Object({
        slug: t.String(),
        reviewId: t.String({ format: 'uuid' })
      })
    }
  );
