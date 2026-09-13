import { cache } from 'react';
import { env } from '@/env';
import { gameDetailsResponseSchema } from './schemas';
import type { GameDetailsResponse } from './types';

export const getGameDetails = cache(async (slug: string): Promise<GameDetailsResponse | null> => {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    const parsed = gameDetailsResponseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error('getGameDetails error:', error);
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
    containsSpoiler?: boolean;
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

export async function deleteGameReview(slug: string, reviewId: string): Promise<void> {
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/games/${encodeURIComponent(slug)}/reviews/${encodeURIComponent(reviewId)}`,
    { method: 'DELETE', credentials: 'include' }
  );
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao remover avaliação');
  }
}
