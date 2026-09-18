import type { Database } from '../../../shared/database';
import { igdbProvider } from '../../../shared/providers/igdb/igdb-provider';
import { steamService } from '../../../shared/providers/steam/steam-service';
import { getPlayedGameSlugs } from './repository';

export function parsePaginationValue(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 0), max);
}

export async function getDiscoverGames(
  db: Database,
  {
    userId,
    played,
    limit,
    offset
  }: {
    userId: string | null;
    played?: string;
    limit?: string;
    offset?: string;
  }
) {
  const parsedLimit = Math.max(parsePaginationValue(limit, 21, 100), 1);
  const parsedOffset = parsePaginationValue(offset, 0, 10_000);
  const requestedSlugs =
    played
      ?.split(',')
      .map((slug) => slug.trim())
      .filter(Boolean) ?? [];
  let playedSlugs = requestedSlugs;

  if (userId) {
    try {
      const storedSlugs = await getPlayedGameSlugs(db, userId);
      playedSlugs = Array.from(new Set([...requestedSlugs, ...storedSlugs]));
    } catch (error) {
      console.warn('Could not fetch played games:', error);
    }
  }

  return igdbProvider.getPersonalizedDiscoverGames({
    playedSlugs,
    limit: parsedLimit,
    offset: parsedOffset
  });
}

export function getPopularGames({ limit, offset }: { limit?: string; offset?: string }) {
  return igdbProvider.getPopularGames(
    Math.max(parsePaginationValue(limit, 21, 100), 1),
    parsePaginationValue(offset, 0, 400)
  );
}

export function getPlatforms(limit?: string) {
  const parsed = Number(limit);
  const parsedLimit = Number.isFinite(parsed)
    ? Math.min(Math.max(Math.trunc(parsed), 1), 500)
    : 100;
  return igdbProvider.getPlatforms(parsedLimit);
}

export function getTopRatedGames({ limit, offset }: { limit?: string; offset?: string }) {
  return igdbProvider.getTopRatedGames(
    Math.max(parsePaginationValue(limit, 18, 100), 1),
    parsePaginationValue(offset, 0, 400)
  );
}

export async function getUpcomingGames(limit?: string) {
  const parsedLimit = Math.max(parsePaginationValue(limit, 18, 100), 1);
  const games = await steamService.getMostAwaitedGames(parsedLimit);
  return games.length > 0 ? games : igdbProvider.getUpcomingGames(parsedLimit);
}

export async function getFeaturedAwaitedGame() {
  const games = await steamService.getMostAwaitedGames(3);
  return games[0] ?? null;
}

export function getTopSellers(limit?: string) {
  return steamService.getTopSellers(Math.max(parsePaginationValue(limit, 18, 100), 1));
}

export async function getPopularNewReleases({
  limit,
  offset
}: {
  limit?: string;
  offset?: string;
}) {
  const parsedLimit = Math.max(parsePaginationValue(limit, 18, 100), 1);
  const parsedOffset = parsePaginationValue(offset, 0, 10_000);
  const games = await steamService.getPopularNewReleases(parsedLimit + parsedOffset);
  return games.slice(parsedOffset, parsedOffset + parsedLimit);
}

export function getNewReleases(limit?: string) {
  return steamService.getPopularNewReleases(Math.max(parsePaginationValue(limit, 18, 100), 1));
}
