import type { IGDBAPIResponse } from '../../types';
import type { InternalApiClient } from '../internal/api-client';
import { buildQuery, type QueryOptions } from '../internal/build-query';

export type CharacterField =
  | 'akas'
  | 'character_gender'
  | 'character_species'
  | 'checksum'
  | 'country_name'
  | 'created_at'
  | 'description'
  | 'games'
  | 'gender'
  | 'mug_shot'
  | 'name'
  | 'slug'
  | 'species'
  | 'updated_at'
  | 'url';

/**
 * @deprecated Use character_gender instead
 */
export enum CharacterGender {
  MALE = 0,
  FEMALE = 1,
  OTHER = 2
}

/**
 * @deprecated Use character_species instead
 */
export enum CharacterSpecies {
  HUMAN = 1,
  ALIEN = 2,
  ANIMAL = 3,
  ANDROID = 4,
  UNKNOWN = 5
}

export interface Character {
  akas: string[];
  character_gender: number;
  character_species: number;
  checksum: string;
  country_name: string;
  created_at: number;
  description: string;
  games: number[];
  /** @deprecated Use character_gender instead */
  gender: CharacterGender;
  mug_shot: number;
  name: string;
  slug: string;
  /** @deprecated Use character_species instead */
  species: CharacterSpecies;
  updated_at: number;
  url: string;
}

/**
 * Checks if array has duplicates - recursive validation
 */
type HasDuplicates<T extends readonly unknown[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends Rest[number]
    ? true
    : HasDuplicates<Rest>
  : false;

export function charactersMethods(client: InternalApiClient) {
  return {
    async list<const T extends readonly CharacterField[]>(
      options: HasDuplicates<T> extends true ? never : QueryOptions<T>
    ): Promise<IGDBAPIResponse<Pick<Character, T[number]>[]>> {
      const body = buildQuery(options);
      return client.post(`/characters`, body);
    }
  };
}
