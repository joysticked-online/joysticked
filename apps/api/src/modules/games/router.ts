import { Elysia } from 'elysia';

import { createReviewRouter } from './create-review/router';
import { getGameRouter } from './get-game/router';
import { homeFeedRouter } from './home-feed/router';
import { popularGamesRouter } from './popular-games/router';
import { searchGamesRouter } from './search-games/router';

export const gamesRouter = new Elysia({ prefix: '/games', tags: ['games'] })
  .use(homeFeedRouter)
  .use(popularGamesRouter)
  .use(searchGamesRouter)
  .use(getGameRouter)
  .use(createReviewRouter);
