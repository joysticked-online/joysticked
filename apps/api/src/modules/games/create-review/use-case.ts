import { and, eq } from 'drizzle-orm';
import type { Database } from '../../../shared/database';
import { gameActivities, gameReviews, users } from '../../../shared/database/schemas';
import { executeTransaction } from '../../../shared/database/transaction';
import { InternalServerError } from '../../../shared/errors/internal-server-error';

type CreateReviewInput = {
  slug: string;
  userId: string;
  gameId: string | number;
  gameTitle: string;
  rating: number;
  reviewText?: string;
  containsSpoiler?: boolean;
  platform?: string;
  hoursPlayed?: string;
};

export async function createReviewUseCase(db: Database, input: CreateReviewInput) {
  const review = await executeTransaction(db, async (tx) => {
    const [createdReview] = await tx
      .insert(gameReviews)
      .values({
        gameId: String(input.gameId),
        gameSlug: input.slug,
        gameTitle: input.gameTitle,
        userId: input.userId,
        rating: input.rating,
        reviewText: input.reviewText || null,
        containsSpoiler: input.containsSpoiler ?? false,
        platform: input.platform || null,
        hoursPlayed: input.hoursPlayed || null
      })
      .onConflictDoUpdate({
        target: [gameReviews.userId, gameReviews.gameId],
        set: {
          gameSlug: input.slug,
          gameTitle: input.gameTitle,
          rating: input.rating,
          reviewText: input.reviewText || null,
          containsSpoiler: input.containsSpoiler ?? false,
          platform: input.platform || null,
          hoursPlayed: input.hoursPlayed || null,
          updatedAt: new Date()
        }
      })
      .returning();

    await tx.insert(gameActivities).values({
      gameId: String(input.gameId),
      gameSlug: input.slug,
      gameTitle: input.gameTitle,
      userId: input.userId,
      type: 'rated',
      detail: input.reviewText
        ? `Avaliou com ${input.rating} estrelas: "${input.reviewText.substring(0, 80)}..."`
        : `Avaliou com ${input.rating} estrelas`,
      platform: input.platform || null
    });

    const [author] = await tx
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl
      })
      .from(users)
      .where(eq(users.id, input.userId));

    if (!createdReview || !author) {
      throw new InternalServerError('Failed to create review');
    }

    return { ...createdReview, likesCount: 0, user: author };
  });

  return { review };
}

export async function deleteReviewUseCase(
  db: Database,
  { reviewId, userId }: { reviewId: string; userId: string }
) {
  const [deletedReview] = await db
    .delete(gameReviews)
    .where(and(eq(gameReviews.id, reviewId), eq(gameReviews.userId, userId)))
    .returning({ id: gameReviews.id });

  return deletedReview?.id ?? null;
}
