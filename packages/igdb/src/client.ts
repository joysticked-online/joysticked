import { version } from '../package.json';

import type { IGDBAPIResponse } from '../types';
import type { InternalApiClient } from './internal/api-client';
import { charactersMethods } from './methods/characters';
import { gamesMethods } from './methods/games';
import { platformsMethods } from './methods/plataform';

export class IGDB {
  private readonly client_id: string;
  private readonly access_token: string;
  private baseUrl = 'https://api.igdb.com/v4';
  private readonly headers: Record<string, string>;
  private readonly api: InternalApiClient;

  readonly games: ReturnType<typeof gamesMethods>;
  readonly characters: ReturnType<typeof charactersMethods>;
  readonly platforms: ReturnType<typeof platformsMethods>;

  constructor({
    client_id,
    access_token,
    baseUrl
  }: {
    client_id: string;
    access_token: string;
    baseUrl?: string;
  }) {
    this.client_id = client_id;
    this.access_token = access_token;
    this.baseUrl = baseUrl ?? this.baseUrl;

    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': `joysticked-igdb-node/${version}`,
      Authorization: `Bearer ${this.access_token}`,
      'Client-ID': this.client_id
    };

    this.api = {
      get: this.get.bind(this),
      post: this.post.bind(this),
      put: this.put.bind(this),
      delete: this.delete.bind(this),
      patch: this.patch.bind(this)
    };

    this.games = gamesMethods(this.api);
    this.characters = charactersMethods(this.api);
    this.platforms = platformsMethods(this.api);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    body?: string | Record<string, unknown>
  ): Promise<IGDBAPIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers,
        body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          data: null,
          error: {
            message: error?.message ?? 'Unknown error'
          }
        };
      }

      const data = await response.json();

      return {
        data,
        error: null
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          data: null,
          error: {
            message: error.message
          }
        };
      }

      const errorMessage =
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Unknown error';

      return {
        data: null,
        error: {
          message: errorMessage
        }
      };
    }
  }

  private async get<T>(path: string): Promise<IGDBAPIResponse<T>> {
    return this.request<T>('GET', path);
  }

  private async post<T>(
    path: string,
    body: string | Record<string, unknown>
  ): Promise<IGDBAPIResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  private async put<T>(
    path: string,
    body: string | Record<string, unknown>
  ): Promise<IGDBAPIResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  private async patch<T>(
    path: string,
    body: string | Record<string, unknown>
  ): Promise<IGDBAPIResponse<T>> {
    return this.request<T>('PATCH', path, body);
  }

  private async delete<T>(
    path: string,
    body?: string | Record<string, unknown>
  ): Promise<IGDBAPIResponse<T>> {
    return this.request<T>('DELETE', path, body);
  }
}
