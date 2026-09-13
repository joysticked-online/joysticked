import type { IgdbGame, IgdbPlatform, IgdbRawGame, IgdbTimeToBeat } from './core';
import { getSearchRelevance, IgdbCoreMethods, normalizeSearchText } from './core';
import { IgdbGenreFallbackMethods } from './genre-fallbacks';

export class IgdbSearchMethods extends IgdbGenreFallbackMethods {
  async getPlatforms(limit = 100): Promise<IgdbPlatform[]> {
    const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 500);
    if (
      this.platformsCache &&
      Date.now() - this.platformsCache.timestamp < IgdbCoreMethods.LIST_CACHE_TTL
    ) {
      return this.platformsCache.data.slice(0, safeLimit);
    }

    const token = await this.getAccessToken();
    if (!token || !this.clientId) return [];

    try {
      const res = await fetch('https://api.igdb.com/v4/platforms', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: `fields name, abbreviation; sort name asc; limit ${safeLimit};`
      });
      if (!res.ok) return [];

      const platforms = (await res.json()) as IgdbPlatform[];
      this.platformsCache = { data: platforms, timestamp: Date.now() };
      return platforms;
    } catch {
      return [];
    }
  }

  /** Fetches playtime estimates using IGDB's game_time_to_beats endpoint. */
  async getTimeToBeat(gameId: number): Promise<IgdbTimeToBeat | null> {
    if (!Number.isInteger(gameId) || gameId <= 0) return null;
    const cacheKey = String(gameId);
    const cached = this.timeToBeatCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < IgdbCoreMethods.LIST_CACHE_TTL)
      return cached.data;

    const token = await this.getAccessToken();
    if (!token || !this.clientId) return null;

    try {
      const res = await fetch('https://api.igdb.com/v4/game_time_to_beats', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: `fields game_id, completely, hastily, normally; where game_id = ${gameId}; limit 1;`
      });
      if (!res.ok) return null;

      const [result] = (await res.json()) as Array<{
        game_id: number;
        completely?: number;
        hastily?: number;
        normally?: number;
      }>;
      const data = result
        ? {
            gameId: result.game_id,
            completely: result.completely,
            hastily: result.hastily,
            normally: result.normally
          }
        : null;
      this.timeToBeatCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    }
  }

  async searchGames(query: string, limit = 20): Promise<IgdbGame[]> {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return [];
    const cacheKey = `${normalizedQuery}:${limit}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < IgdbCoreMethods.SEARCH_CACHE_TTL) {
      return cached.data;
    }

    const rankMatches = (games: IgdbGame[]) => {
      const seenNames = new Set<string>();
      return games
        .map((game) => ({ game, relevance: getSearchRelevance(game, normalizedQuery) }))
        .filter(({ relevance }) => relevance > 0)
        .sort((a, b) => b.relevance - a.relevance || (b.game.rating || 0) - (a.game.rating || 0))
        .filter(({ game }) => {
          const name = normalizeSearchText(game.name);
          if (seenNames.has(name)) return false;
          seenNames.add(name);
          return true;
        })
        .slice(0, limit)
        .map(({ game }) => game);
    };

    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return rankMatches(this.getFallbackGames());
    }

    try {
      const sanitized = query.replace(/"/g, '\\"');
      const fetchLimit = Math.min(Math.max(limit * 3, 30), 100);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.id, genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        search "${sanitized}";
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
      const result = rankMatches(
        rawGames
          .map((g) => this.transformGame(g))
          .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category))
      );
      this.searchCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch {
      return [];
    }
  }

  /**
   * Search IGDB by game title to obtain high-quality cover, banner, and IGDB slug.
   * Uses an in-memory cache to ensure instant lookups on subsequent calls.
   */
  async searchGameMediaByTitle(title: string): Promise<{
    coverUrl?: string;
    bannerUrl?: string;
    slug?: string;
    genres?: string[];
    platforms?: string[];
  } | null> {
    if (!title?.trim()) return null;
    const key = title.trim().toLowerCase();
    if (this.mediaCache.has(key)) {
      return this.mediaCache.get(key)!;
    }

    const token = await this.getAccessToken();
    if (!token || !this.clientId) return null;

    try {
      // Query variants to handle subtitles, suffixes like ": The Game", etc.
      const queryVariants = [
        title,
        title.replace(/:\s*The Game$/i, '').trim(),
        title.replace(/\b(The Game|Edition|Remastered|Definitive|VR)\b/gi, '').trim()
      ].filter((v, i, arr) => arr.indexOf(v) === i && v.length > 0);

      let bestMatch: IgdbRawGame | null = null;

      for (const q of queryVariants) {
        const clean = q
          .replace(/[:\-–—]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const res = await fetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers: {
            'Client-ID': this.clientId,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/plain'
          },
          body: `
            fields name, slug, cover.image_id, artworks.image_id, screenshots.image_id, genres.name, platforms.name, game_modes.name;
            search "${clean.replace(/"/g, '')}";
            limit 5;
          `
        });

        if (res.ok) {
          const items = (await res.json()) as IgdbRawGame[];
          if (Array.isArray(items) && items.length > 0) {
            const exact = items.find(
              (it) =>
                it.name.toLowerCase() === title.toLowerCase() ||
                it.name.toLowerCase() === q.toLowerCase()
            );
            bestMatch = exact || items[0];
            if (exact) break;
          }
        }
      }

      if (!bestMatch) {
        return null;
      }

      const coverUrl = bestMatch.cover?.image_id
        ? this.formatImageUrl(bestMatch.cover.image_id, 't_cover_big')
        : undefined;

      const artworkId = bestMatch.artworks?.[0]?.image_id || bestMatch.screenshots?.[0]?.image_id;
      const bannerUrl = artworkId ? this.formatImageUrl(artworkId, 't_1080p') : undefined;

      const result = {
        coverUrl,
        bannerUrl,
        slug: bestMatch.slug,
        genres: bestMatch.genres?.map((g: any) => g.name),
        platforms: bestMatch.platforms?.map((p: any) => p.name)
      };

      this.mediaCache.set(key, result);
      return result;
    } catch (err) {
      console.warn('[IgdbProvider] Error searching media for:', title, err);
      return null;
    }
  }

  /**
   * Enriches a list of games (sourced from Steam or other stores) with IGDB images and slugs.
   */
  async enrichGamesWithIgdbMedia(games: any[]): Promise<any[]> {
    if (!Array.isArray(games) || games.length === 0) return games;

    return Promise.all(
      games.map(async (g) => {
        try {
          // If game already has an IGDB-hosted cover, don't overwrite
          if (g.coverUrl?.includes('images.igdb.com')) {
            return g;
          }

          const media = await this.searchGameMediaByTitle(g.name);
          if (media?.coverUrl) {
            return {
              ...g,
              coverUrl: media.coverUrl,
              bannerUrl: media.bannerUrl || g.bannerUrl,
              slug: media.slug || g.slug,
              platforms: g.platforms && g.platforms.length > 0 ? g.platforms : media.platforms,
              genres: g.genres && g.genres.length > 0 ? g.genres : media.genres
            };
          }
        } catch (err) {
          console.warn('[IgdbProvider] Error enriching game:', g.name, err);
        }
        return g;
      })
    );
  }
}
