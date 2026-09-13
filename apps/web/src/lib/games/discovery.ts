import { env } from '@/env';
import { discoverResponseSchema } from './schemas';
import type { DiscoverResponse } from './types';

export async function getDiscoverGames({
  played = [],
  offset = 0,
  limit = 21
}: {
  played?: string[];
  offset?: number;
  limit?: number;
} = {}): Promise<DiscoverResponse> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    if (played.length > 0) params.set('played', played.join(','));
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/games/discover?${params.toString()}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error('Falha ao buscar recomendações personalizadas');
    const parsed = discoverResponseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : { games: [], basedOn: [], hasMore: false };
  } catch (error) {
    console.error('getDiscoverGames error:', error);
    return { games: [], basedOn: [], hasMore: false };
  }
}
