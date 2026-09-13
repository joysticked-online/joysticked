export {
  getFeaturedAwaitedGame,
  getPopularGames,
  getPopularNewReleases,
  getTopRatedGames,
  getTopSellers,
  getUpcomingGames
} from './games/catalog';
export { deleteGameReview, getGameDetails, submitGameReview } from './games/details';
export { getDiscoverGames } from './games/discovery';
export { getHomeFeed } from './games/home-feed';
export { searchGames } from './games/search';
export type * from './games/types';
