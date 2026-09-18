import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';

export async function searchGames(query: { q?: string; limit?: string }) {
  const parsedLimit = Number(query.limit);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 100)
    : 20;

  if (!query.q?.trim()) {
    return igdbProvider.getPopularGames(limit);
  }

  return igdbProvider.searchGames(query.q, limit);
}
