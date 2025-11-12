import type { IGDBAPIResponse } from '../../types';
import type { InternalApiClient } from '../internal/api-client';
import { buildQuery, type QueryOptions } from '../internal/build-query';
import type { HasDuplicates } from '../utils';

export type PlatformField =
  | 'abbreviation'
  | 'alternative_name'
  | 'category'
  | 'checksum'
  | 'created_at'
  | 'generation'
  | 'name'
  | 'platform_family'
  | 'platform_logo'
  | 'platform_type'
  | 'slug'
  | 'summary'
  | 'updated_at'
  | 'url'
  | 'versions'
  | 'websites';

/**
 * Platform category enum values
 * @deprecated Use platform_type instead
 */
export enum PlatformCategory {
  CONSOLE = 1,
  ARCADE = 2,
  PLATFORM = 3,
  OPERATING_SYSTEM = 4,
  PORTABLE_CONSOLE = 5,
  COMPUTER = 6
}

export interface Platform {
  abbreviation: string;
  alternative_name: string;
  /** @deprecated Use platform_type instead */
  category: PlatformCategory;
  checksum: string;
  created_at: number;
  generation: number;
  name: string;
  platform_family: number;
  platform_logo: number;
  platform_type: number;
  slug: string;
  summary: string;
  updated_at: number;
  url: string;
  versions: number[];
  websites: number[];
}

export function platformsMethods(client: InternalApiClient) {
  return {
    async list<const T extends readonly PlatformField[]>(
      options: HasDuplicates<T> extends true ? never : QueryOptions<T>
    ): Promise<IGDBAPIResponse<Pick<Platform, T[number]>[]>> {
      const body = buildQuery(options);
      return client.post(`/platforms`, body);
    }
  };
}
