import { igdbProvider } from '../../shared/providers/igdb/igdb-provider';
import { steamService } from '../../shared/providers/steam/steam-service';
import { getPopularReviews, getRecentActivities } from './repository';

const HOME_CACHE_TTL_MS = 30_000;

type HomeFeed = Awaited<ReturnType<typeof buildHomeFeed>>;
let homeCache: { expiresAt: number; value: HomeFeed } | null = null;

async function buildHomeFeed() {
  const [popularResult, topRatedResult, steamAwaitedResult] = await Promise.allSettled([
    igdbProvider.getPopularGames(3),
    igdbProvider.getTopRatedGames(3),
    steamService.getMostAwaitedGames(3)
  ]);

  const popularGames = popularResult.status === 'fulfilled' ? popularResult.value : [];
  const topRatedGames = topRatedResult.status === 'fulfilled' ? topRatedResult.value : [];
  let upcomingGames = steamAwaitedResult.status === 'fulfilled' ? steamAwaitedResult.value : [];

  if (upcomingGames.length === 0) {
    upcomingGames = await igdbProvider.getUpcomingGames(3).catch((error) => {
      console.warn('Could not fetch upcoming games:', error);
      return [];
    });
  }

  const [popularReviews, activities] = await Promise.all([
    getPopularReviews(),
    getRecentActivities()
  ]);

  return { popularGames, topRatedGames, upcomingGames, popularReviews, activities };
}

export async function getHomeFeed() {
  if (homeCache && homeCache.expiresAt > Date.now()) return homeCache.value;

  const value = await buildHomeFeed();
  homeCache = { value, expiresAt: Date.now() + HOME_CACHE_TTL_MS };
  return value;
}
