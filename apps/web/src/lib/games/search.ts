import { env } from '@/env';
import { gameListResponseSchema } from './schemas';
import type { Game } from './types';

export async function searchGames(query: string, signal?: AbortSignal): Promise<Game[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games?q=${encodeURIComponent(query)}`, {
      cache: 'no-store',
      signal
    });
    if (!res.ok) throw new Error('Falha ao buscar jogos');
    const parsed = gameListResponseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data.games : [];
  } catch (error) {
    console.error('searchGames error:', error);
    return [];
  }
}
