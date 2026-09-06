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

export async function getPopularGames(limit = 12): Promise<Game[]> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/popular?limit=${limit}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error('Falha ao buscar jogos populares');
    const data = await res.json();
    return data.games || [];
  } catch (err) {
    console.error('getPopularGames error:', err);
    return [];
  }
}

export async function getGameDetails(slug: string): Promise<GameDetailsResponse | null> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(slug)}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('getGameDetails error:', err);
    return null;
  }
}

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
