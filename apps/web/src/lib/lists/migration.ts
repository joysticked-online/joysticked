import { z } from 'zod';
import type { Game } from '@/lib/games/types';
import type { UserList } from './types';

const gameSchema: z.ZodType<Game> = z
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

const userListSchema: z.ZodType<UserList> = z
  .object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    ownerUsername: z.string(),
    ownerDisplayName: z.string().nullable().optional(),
    ownerAvatarUrl: z.string().nullable().optional(),
    isPublic: z.boolean(),
    coverGameSlug: z.string().optional(),
    coverUrl: z.string().nullable().optional(),
    games: z.array(gameSchema),
    gameCount: z.number(),
    likesCount: z.number(),
    tags: z.array(z.string()).optional(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
  .passthrough();

export function migrateStoredLists(value: unknown): UserList[] {
  const parsed = z.array(userListSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function migrateLikedListIds(value: unknown): string[] {
  const parsed = z.array(z.string()).safeParse(value);
  return parsed.success ? parsed.data : [];
}
