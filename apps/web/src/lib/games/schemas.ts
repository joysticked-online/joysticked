import { z } from 'zod';
import type { Game, GameActivity, GameDetailsResponse, GameReview, HomeFeedData } from './types';

export const gameSchema: z.ZodType<Game> = z
  .object({
    id: z.union([z.number(), z.string()]),
    name: z.string(),
    slug: z.string(),
    summary: z.string().nullable().optional(),
    storyline: z.string().nullable().optional(),
    coverUrl: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(),
    artworks: z.array(z.string()).optional(),
    screenshots: z.array(z.string()).optional(),
    genres: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    gameModes: z.array(z.string()).optional(),
    firstReleaseDate: z.string().nullable().optional(),
    releaseYear: z.string().nullable().optional(),
    developer: z.string().nullable().optional(),
    publisher: z.string().nullable().optional(),
    rating: z.number().nullable().optional(),
    aggregatedRating: z.number().nullable().optional(),
    ratingCount: z.number().nullable().optional(),
    totalRating: z.number().nullable().optional(),
    isSteamAwaited: z.boolean().optional(),
    isSteamTopSeller: z.boolean().optional(),
    isSteamNewRelease: z.boolean().optional()
  })
  .passthrough();

const reviewUserSchema: z.ZodType<GameReview['user']> = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable()
});

const reviewSchema: z.ZodType<GameReview> = z.object({
  id: z.string(),
  gameId: z.string(),
  gameSlug: z.string(),
  gameTitle: z.string(),
  userId: z.string(),
  user: reviewUserSchema,
  rating: z.number(),
  reviewText: z.string().nullable(),
  containsSpoiler: z.boolean().optional(),
  platform: z.string().nullable(),
  hoursPlayed: z.string().nullable(),
  likesCount: z.number(),
  createdAt: z.string()
});

const activitySchema: z.ZodType<GameActivity> = z.object({
  id: z.string(),
  gameId: z.string(),
  gameSlug: z.string(),
  gameTitle: z.string(),
  userId: z.string(),
  user: reviewUserSchema,
  type: z.string(),
  detail: z.string().nullable(),
  platform: z.string().nullable(),
  createdAt: z.string()
});

export const gameListResponseSchema = z.object({ games: z.array(gameSchema) });
export const discoverResponseSchema: z.ZodType<{
  games: Game[];
  basedOn: string[];
  hasMore: boolean;
}> = z.object({
  games: z.array(gameSchema),
  basedOn: z.array(z.string()),
  hasMore: z.boolean()
});
export const gameDetailsResponseSchema: z.ZodType<GameDetailsResponse> = z.object({
  game: gameSchema,
  reviews: z.array(reviewSchema),
  activities: z.array(activitySchema),
  similarGames: z.array(gameSchema).optional(),
  recommendedGames: z.array(gameSchema).optional()
});
export const homeFeedDataSchema: z.ZodType<HomeFeedData> = z.object({
  popularGames: z.array(gameSchema),
  topRatedGames: z.array(gameSchema),
  upcomingGames: z.array(gameSchema).optional(),
  popularReviews: z.array(reviewSchema),
  activities: z.array(activitySchema)
});
