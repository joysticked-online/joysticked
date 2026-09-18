import type { IgdbGame, IgdbRawGame } from '../types';
import { IgdbCoreMethods } from './core';
import { IgdbRecommendationMethods } from './recommendations';

export class IgdbCatalogMethods extends IgdbRecommendationMethods {
  async getPopularGames(limit = 12, offset = 0): Promise<IgdbGame[]> {
    const cacheKey = `${limit}:${offset}`;
    const cached = this.popularCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < IgdbCoreMethods.LIST_CACHE_TTL) {
      return cached.data;
    }
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return this.getFallbackGames().slice(0, limit);
    }

    try {
      const fetchLimit = Math.min(Math.max(limit * 2, 30), 500);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating, rating_count,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where rating_count > 100 & cover != null;
        sort rating_count desc;
        offset ${offset};
        limit ${fetchLimit};
      `;

      const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body
      });

      if (!res.ok) {
        console.error('IGDB API popular error:', await res.text());
        return this.getFallbackGames().slice(0, limit);
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      const transformed = rawGames
        .map((g) => this.transformGame(g))
        .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category));

      if (transformed.length < limit) {
        const fallbacks = this.getFallbackGames();
        for (const f of fallbacks) {
          if (!transformed.some((t) => t.slug === f.slug)) {
            transformed.push(f);
          }
        }
      }

      const result = transformed.slice(0, limit);
      this.popularCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (err) {
      console.error('Error fetching popular games from IGDB:', err);
      return this.getFallbackGames().slice(0, limit);
    }
  }

  async getTopRatedGames(limit = 6, offset = 0): Promise<IgdbGame[]> {
    const cacheKey = `${limit}:${offset}`;
    const cached = this.topRatedCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < IgdbCoreMethods.LIST_CACHE_TTL) {
      return cached.data;
    }
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return this.getFallbackGames().slice(0, limit);
    }

    try {
      const fetchLimit = Math.min(Math.max(limit * 3, 25), 500);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating, rating_count,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where rating_count > 500 & cover != null;
        sort rating desc;
        offset ${offset};
        limit ${fetchLimit};
      `;

      const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body
      });

      if (!res.ok) {
        return this.getFallbackGames().slice(0, limit);
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      const filtered = rawGames
        .map((g) => this.transformGame(g))
        .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category));

      const result = filtered.slice(0, limit);
      this.topRatedCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return this.getFallbackGames().slice(0, limit);
    }
  }

  /**
   * Generates personalized game recommendations for the "Descubra" tab based on games the user has played.
   * Supports offset and limit for infinite scroll.
   */
  async getPersonalizedDiscoverGames({
    playedSlugs = [],
    limit = 18,
    offset = 0
  }: {
    playedSlugs?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ games: IgdbGame[]; basedOn: string[]; hasMore: boolean }> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      const fallback = this.getFallbackGames();
      return {
        games: fallback.slice(offset, offset + limit),
        basedOn: [],
        hasMore: offset + limit < fallback.length
      };
    }

    try {
      // 1. Resolve played games to extract their genres and exclude their IDs
      const playedGames: IgdbGame[] = [];
      for (const slug of playedSlugs.slice(0, 6)) {
        const g = await this.getGameBySlugOrId(slug);
        if (g) playedGames.push(g);
      }

      const basedOnNames = playedGames.map((g) => g.name);
      const playedIds = playedGames.map((g) => g.id);
      const genreSet = new Set<number>();
      for (const g of playedGames) {
        for (const id of g.genreIds || []) {
          genreSet.add(id);
        }
      }

      const genres = Array.from(genreSet);
      let whereClause = 'where cover != null & rating != null & rating_count > 30';

      if (genres.length > 0) {
        // IGDB syntax for array contains any: (genres = (12) | genres = (31))
        const genreFilters = genres
          .slice(0, 4)
          .map((id) => `genres = (${id})`)
          .join(' | ');
        whereClause += ` & (${genreFilters})`;
      }

      if (playedIds.length > 0) {
        const idFilters = playedIds.map((id) => `id != ${id}`).join(' & ');
        whereClause += ` & ${idFilters}`;
      }

      const fetchCount = Math.max(limit * 3, 60);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.id, genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating, rating_count;
        ${whereClause};
        sort rating desc;
        offset ${offset};
        limit ${fetchCount};
      `;

      const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body
      });

      if (!res.ok) {
        console.error(
          '[IgdbProvider] discover query error:',
          res.status,
          await res.text(),
          'Body:',
          body
        );
      } else {
        const rawGames = (await res.json()) as IgdbRawGame[];
        const filtered = rawGames
          .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category))
          .map((g) => this.transformGame(g));

        // If filtered returned less than limit, supplement with fallback games
        if (filtered.length < limit) {
          const fallbacks = this.getFallbackGames();
          for (const f of fallbacks) {
            if (
              !filtered.some((g) => g.id === f.id || g.slug === f.slug) &&
              !playedIds.includes(f.id)
            ) {
              filtered.push(f);
              if (filtered.length >= limit) break;
            }
          }
        }

        const slice = filtered.slice(0, limit);
        const hasMore = filtered.length >= limit;

        if (slice.length > 0) {
          return {
            games: slice,
            basedOn: basedOnNames,
            hasMore
          };
        }
      }
    } catch (err) {
      console.warn('[IgdbProvider] Error getting personalized discover games:', err);
    }

    const fallback = this.getFallbackGames();
    return {
      games: fallback.slice(offset, offset + limit),
      basedOn: [],
      hasMore: offset + limit < fallback.length
    };
  }

  async getUpcomingGames(limit = 6): Promise<IgdbGame[]> {
    const cacheKey = String(limit);
    const cached = this.upcomingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < IgdbCoreMethods.LIST_CACHE_TTL) {
      return cached.data;
    }
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return [];
    }

    try {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const fetchLimit = Math.max(limit * 3, 20);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, hypes, rating,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where first_release_date > ${nowSeconds} & cover != null & category = (0, 8, 9);
        sort hypes desc;
        limit ${fetchLimit};
      `;

      const res = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body
      });

      if (!res.ok) {
        return [];
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      const filtered = rawGames
        .map((g) => this.transformGame(g))
        .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category));

      const result = filtered.slice(0, limit);
      this.upcomingCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return [];
    }
  }
}
