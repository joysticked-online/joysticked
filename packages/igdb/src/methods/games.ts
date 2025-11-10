import type { IGDBAPIResponse } from '../../types';
import type { InternalApiClient } from '../internal/api-client';
import { buildQuery, type QueryOptions } from '../internal/build-query';

export type GameField =
  | 'age_ratings'
  | 'aggregated_rating'
  | 'aggregated_rating_count'
  | 'alternative_names'
  | 'artworks'
  | 'bundles'
  | 'category'
  | 'checksum'
  | 'collection'
  | 'collections'
  | 'cover'
  | 'created_at'
  | 'dlcs'
  | 'expanded_games'
  | 'expansions'
  | 'external_games'
  | 'first_release_date'
  | 'follows'
  | 'forks'
  | 'franchise'
  | 'franchises'
  | 'game_engines'
  | 'game_localizations'
  | 'game_modes'
  | 'game_status'
  | 'game_type'
  | 'genres'
  | 'hypes'
  | 'involved_companies'
  | 'keywords'
  | 'language_supports'
  | 'multiplayer_modes'
  | 'name'
  | 'parent_game'
  | 'platforms'
  | 'player_perspectives'
  | 'ports'
  | 'rating'
  | 'rating_count'
  | 'release_dates'
  | 'remakes'
  | 'remasters'
  | 'screenshots'
  | 'similar_games'
  | 'slug'
  | 'standalone_expansions'
  | 'status'
  | 'storyline'
  | 'summary'
  | 'tags'
  | 'themes'
  | 'total_rating'
  | 'total_rating_count'
  | 'updated_at'
  | 'url'
  | 'version_parent'
  | 'version_title'
  | 'videos'
  | 'websites';

export type GenreField = 'checksum' | 'created_at' | 'name' | 'slug' | 'updated_at' | 'url';

/**
 * Game category enum values
 */
export enum GameCategory {
  MAIN_GAME = 0,
  DLC_ADDON = 1,
  EXPANSION = 2,
  BUNDLE = 3,
  STANDALONE_EXPANSION = 4,
  MOD = 5,
  EPISODE = 6,
  SEASON = 7,
  REMAKE = 8,
  REMASTER = 9,
  EXPANDED_GAME = 10,
  PORT = 11,
  FORK = 12,
  PACK = 13,
  UPDATE = 14
}

/**
 * Game status enum values
 */
export enum GameStatus {
  RELEASED = 0,
  ALPHA = 2,
  BETA = 3,
  EARLY_ACCESS = 4,
  OFFLINE = 5,
  CANCELLED = 6,
  RUMORED = 7,
  DELISTED = 8
}

/**
 * Complete Game type with all IGDB fields
 */
export interface Game {
  age_ratings: number[];
  aggregated_rating: number;
  aggregated_rating_count: number;
  alternative_names: number[];
  artworks: number[];
  bundles: number[];
  /** @deprecated Use game_type instead */
  category: GameCategory;
  checksum: string;
  /** @deprecated Use collections instead */
  collection: number;
  collections: number[];
  cover: number;
  created_at: number;
  dlcs: number[];
  expanded_games: number[];
  expansions: number[];
  external_games: number[];
  first_release_date: number;
  /** @deprecated To be removed */
  follows: number;
  forks: number[];
  franchise: number;
  franchises: number[];
  game_engines: number[];
  game_localizations: number[];
  game_modes: number[];
  game_status: number;
  game_type: number;
  genres: number[];
  hypes: number;
  involved_companies: number[];
  keywords: number[];
  language_supports: number[];
  multiplayer_modes: number[];
  name: string;
  parent_game: number;
  platforms: number[];
  player_perspectives: number[];
  ports: number[];
  rating: number;
  rating_count: number;
  release_dates: number[];
  remakes: number[];
  remasters: number[];
  screenshots: number[];
  similar_games: number[];
  slug: string;
  standalone_expansions: number[];
  /** @deprecated Use game_status instead */
  status: GameStatus;
  storyline: string;
  summary: string;
  tags: number[];
  themes: number[];
  total_rating: number;
  total_rating_count: number;
  updated_at: number;
  url: string;
  version_parent: number;
  version_title: string;
  videos: number[];
  websites: number[];
}

/**
 * Checks if array has duplicates - recursive validation
 */
type HasDuplicates<T extends readonly unknown[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends Rest[number]
    ? true
    : HasDuplicates<Rest>
  : false;

export function gamesMethods(client: InternalApiClient) {
  return {
    async list<const T extends readonly GameField[]>(
      options: HasDuplicates<T> extends true ? never : QueryOptions<T>
    ): Promise<IGDBAPIResponse<Pick<Game, T[number]>[]>> {
      const body = buildQuery(options);
      return client.post(`/games`, body);
    },

    async genres<const T extends readonly GenreField[]>(
      options: HasDuplicates<T> extends true ? never : { fields: T }
    ): Promise<IGDBAPIResponse<Pick<Game, T[number]>[]>> {
      const body = buildQuery(options);
      return client.post(`/genres`, body);
    }
  };
}
