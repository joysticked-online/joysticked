import { cache } from 'react';
import { env } from '@/env';

export interface Game {
  id: number | string;
  name: string;
  slug: string;
  summary?: string | null;
  storyline?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  artworks?: string[];
  screenshots?: string[];
  genres?: string[];
  platforms?: string[];
  firstReleaseDate?: string | null;
  releaseYear?: string | null;
  developer?: string | null;
  publisher?: string | null;
  rating?: number | null;
  aggregatedRating?: number | null;
  ratingCount?: number | null;
  totalRating?: number | null;
  similarGames?: Game[];
  recommendedGames?: Game[];
  isSteamAwaited?: boolean;
  isSteamTopSeller?: boolean;
  isSteamNewRelease?: boolean;
}

export interface ReviewUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface GameReview {
  id: string;
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  userId: string;
  user: ReviewUser;
  rating: number;
  reviewText: string | null;
  platform: string | null;
  hoursPlayed: string | null;
  likesCount: number;
  createdAt: string;
}

export interface GameActivity {
  id: string;
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  userId: string;
  user: ReviewUser;
  type: string;
  detail: string | null;
  platform: string | null;
  createdAt: string;
}

export interface GameDetailsResponse {
  game: Game;
  reviews: GameReview[];
  activities: GameActivity[];
  similarGames?: Game[];
  recommendedGames?: Game[];
}

export async function searchGames(query: string): Promise<Game[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games?q=${encodeURIComponent(query)}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Falha ao buscar jogos');
    const data = await res.json();
    return data.games || [];
  } catch (err) {
    console.error('searchGames error:', err);
    return [];
  }
}

export interface DiscoverResponse {
  games: Game[];
  basedOn: string[];
  hasMore: boolean;
}

export async function getDiscoverGames({
  played = [],
  offset = 0,
  limit = 21,
  userId
}: {
  played?: string[];
  offset?: number;
  limit?: number;
  userId?: string;
} = {}): Promise<DiscoverResponse> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    if (played.length > 0) {
      params.set('played', played.join(','));
    }
    if (userId) {
      params.set('userId', userId);
    }

    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/discover?${params.toString()}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Falha ao buscar recomendações personalizadas');
    const data = await res.json();
    return {
      games: data.games || [],
      basedOn: data.basedOn || [],
      hasMore: data.hasMore ?? false
    };
  } catch (err) {
    console.error('getDiscoverGames error:', err);
    return { games: [], basedOn: [], hasMore: false };
  }
}

async function fetchApi<T>(path: string, init: RequestInit | undefined, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, init);
    if (!res.ok) return fallback;
    return await res.json();
  } catch (err) {
    console.error(`fetchApi error on ${path}:`, err);
    return fallback;
  }
}

export async function getPopularGames(limit = 18, offset = 0): Promise<Game[]> {
  const data = await fetchApi<{ games?: Game[] }>(
    `/games/popular?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games || [];
}

export async function getTopRatedGames(limit = 18, offset = 0): Promise<Game[]> {
  const data = await fetchApi<{ games?: Game[] }>(
    `/games/top-rated?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games || [];
}

export async function getUpcomingGames(limit = 18): Promise<Game[]> {
  const data = await fetchApi<{ games?: Game[] }>(
    `/games/upcoming?limit=${limit}`,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games || [];
}

export async function getFeaturedAwaitedGame(): Promise<Game | null> {
  const data = await fetchApi<{ game?: Game }>(
    '/games/featured-awaited',
    { next: { revalidate: 3600 } },
    {}
  );
  return data.game || null;
}

export async function getTopSellers(limit = 18): Promise<Game[]> {
  const data = await fetchApi<{ games?: Game[] }>(
    `/games/top-sellers?limit=${limit}`,
    { next: { revalidate: 3600 } },
    { games: [] }
  );
  return data.games || [];
}

export async function getPopularNewReleases(limit = 18, offset = 0): Promise<Game[]> {
  const data = await fetchApi<{ games?: Game[] }>(
    `/games/popular-new-releases?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 1800 } },
    { games: [] }
  );
  return data.games || [];
}

export const getGameDetails = cache(async (slug: string): Promise<GameDetailsResponse | null> => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getGameDetails error:', err);
    return null;
  }
});

export async function submitGameReview(
  slug: string,
  data: {
    gameId: string | number;
    gameTitle: string;
    rating: number;
    reviewText?: string;
    platform?: string;
    hoursPlayed?: string;
  }
) {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(slug)}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao enviar avaliação');
  }

  return await res.json();
}

export interface HomeFeedData {
  popularGames: Game[];
  topRatedGames: Game[];
  upcomingGames?: Game[];
  popularReviews: GameReview[];
  activities: GameActivity[];
}

export async function getHomeFeed(): Promise<HomeFeedData> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/home`, {
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('getHomeFeed failed:', err);
  }

  return {
    popularGames: [],
    topRatedGames: [],
    upcomingGames: [],
    popularReviews: [],
    activities: []
  };
}
