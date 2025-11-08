import type { IGDBAPIResponse } from '../../types';

/**
 *
 * Internal API client interface that resources use to make HTTP requests.
 * This interface is not exposed to SDK users.
 */
export interface InternalApiClient {
  get: <T>(path: string) => Promise<IGDBAPIResponse<T>>;
  post: <T>(path: string, body: string | Record<string, unknown>) => Promise<IGDBAPIResponse<T>>;
  put: <T>(path: string, body: string | Record<string, unknown>) => Promise<IGDBAPIResponse<T>>;
  patch: <T>(path: string, body: string | Record<string, unknown>) => Promise<IGDBAPIResponse<T>>;
  delete: <T>(path: string, body?: string | Record<string, unknown>) => Promise<IGDBAPIResponse<T>>;
}
