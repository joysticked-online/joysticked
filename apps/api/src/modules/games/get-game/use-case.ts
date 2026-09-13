import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';
import { getGameActivities, getGameReviews } from './repository';

export function getTimeToBeat(gameId: number) {
  return igdbProvider.getTimeToBeat(gameId);
}

export async function getGameDetails(slug: string) {
  const game = await igdbProvider.getGameBySlugOrId(slug);
  if (!game) return null;

  const [reviews, activities, recommendedGames] = await Promise.all([
    getGameReviews(game.slug),
    getGameActivities(game.slug),
    igdbProvider.getRecommendedGames(game, 8)
  ]);

  return {
    game,
    reviews,
    activities,
    similarGames: game.similarGames ?? [],
    recommendedGames
  };
}
