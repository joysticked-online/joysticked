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

export type GenreField =
  | 'checksum'
  | 'created_at'
  | 'name'
  | 'slug'
  | 'updated_at'
  | "url";

export function gamesMethods(client: InternalApiClient) {
  return {
    async list<T>(options: QueryOptions<GameField[]>): Promise<IGDBAPIResponse<T>> {
      const body = buildQuery(options);

      return client.post(`/games`, body);
    },
    async genres<T>(options: Pick<QueryOptions<GenreField[]>, 'fields'>): Promise<IGDBAPIResponse<T>> {
      const body = buildQuery(options);

      return client.post(`/genres`, body);
    },
  };
}
