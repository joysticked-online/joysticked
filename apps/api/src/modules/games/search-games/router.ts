import { Elysia, t } from 'elysia';
import { searchGames } from './use-case';

export const searchGamesRouter = new Elysia().get(
  '/',
  async ({ query }) => ({ games: await searchGames(query) }),
  {
    query: t.Object({
      q: t.Optional(t.String()),
      limit: t.Optional(t.String())
    })
  }
);
