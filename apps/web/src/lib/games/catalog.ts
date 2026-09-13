import { z } from 'zod';
import { env } from '@/env';
import { gameListResponseSchema, gameSchema } from './schemas';
import type { Game } from './types';

type GameListResponse = z.infer<typeof gameListResponseSchema>;
type FeaturedGameResponse = { game?: Game };

async function fetchApi<T>(
  path: string,
  schema: z.ZodType<T>,
  init: RequestInit | undefined,
  fallback: T
): Promise<T> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, init);
    if (!res.ok) return fallback;
    const parsed = schema.safeParse(await res.json());
    return parsed.success ? parsed.data : fallback;
  } catch (error) {
    console.error(`fetchApi error on ${path}:`, error);
    return fallback;
  }
}

export async function getPopularGames(limit = 18, offset = 0): Promise<Game[]> {
  const data = await fetchApi<GameListResponse>(
    `/games/popular?limit=${limit}&offset=${offset}`,
    gameListResponseSchema,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games;
}

export async function getTopRatedGames(limit = 18, offset = 0): Promise<Game[]> {
  const data = await fetchApi<GameListResponse>(
    `/games/top-rated?limit=${limit}&offset=${offset}`,
    gameListResponseSchema,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games;
}

export async function getUpcomingGames(limit = 18): Promise<Game[]> {
  const data = await fetchApi<GameListResponse>(
    `/games/upcoming?limit=${limit}`,
    gameListResponseSchema,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games;
}

export async function getFeaturedAwaitedGame(): Promise<Game | null> {
  const data = await fetchApi<FeaturedGameResponse>(
    '/games/featured-awaited',
    z.object({ game: gameSchema.optional() }),
    { next: { revalidate: 3600 } },
    {}
  );
  return data.game ?? null;
}

export async function getTopSellers(limit = 18): Promise<Game[]> {
  const data = await fetchApi<GameListResponse>(
    `/games/top-sellers?limit=${limit}`,
    gameListResponseSchema,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games;
}

export async function getPopularNewReleases(limit = 18, offset = 0): Promise<Game[]> {
  const data = await fetchApi<GameListResponse>(
    `/games/popular-new-releases?limit=${limit}&offset=${offset}`,
    gameListResponseSchema,
    { next: { revalidate: 1800 } },
    { games: [] }
  );
  return data.games;
}
