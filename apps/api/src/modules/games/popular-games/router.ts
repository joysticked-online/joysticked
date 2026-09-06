import { Elysia, t } from 'elysia';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';

export const popularGamesRouter = new Elysia().get(
  '/popular',
  async ({ query }) => {
    const limit = query.limit ? Number(query.limit) : 12;
    const games = await igdbProvider.getPopularGames(limit);
    return { games };
  },
  {
    query: t.Object({
      limit: t.Optional(t.String())
    })
  }
);
