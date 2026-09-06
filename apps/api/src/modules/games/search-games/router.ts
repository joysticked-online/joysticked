import { Elysia, t } from 'elysia';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';

export const searchGamesRouter = new Elysia().get(
  '/',
  async ({ query }) => {
    const q = query.q || '';
    const limit = query.limit ? Number(query.limit) : 20;

    if (!q.trim()) {
      const popular = await igdbProvider.getPopularGames(limit);
      return { games: popular };
    }

    const games = await igdbProvider.searchGames(q, limit);
    return { games };
  },
  {
    query: t.Object({
      q: t.Optional(t.String()),
      limit: t.Optional(t.String())
    })
  }
);
