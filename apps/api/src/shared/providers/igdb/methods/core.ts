import { envs } from '../../../config/envs';
import { ADMIN_GAME_BANNERS } from '../../../constants/admin-banners';
import { isForbiddenGame } from './search-policy';
import type { IgdbGame, IgdbPlatform, IgdbRawGame, IgdbTimeToBeat } from '../types';

export type { IgdbGame, IgdbPlatform, IgdbRawGame, IgdbTimeToBeat } from '../types';

export class IgdbCoreMethods {
  protected static readonly LIST_CACHE_TTL = 5 * 60 * 1000;
  protected static readonly SEARCH_CACHE_TTL = 60 * 1000;
  protected clientId: string | undefined;
  protected clientSecret: string | undefined;
  protected accessToken: string | null = null;
  protected tokenExpiresAt: number = 0;
  protected mediaCache = new Map<
    string,
    {
      coverUrl?: string;
      bannerUrl?: string;
      slug?: string;
      genres?: string[];
      platforms?: string[];
    }
  >();
  protected gameDetailsCache = new Map<string, { data: IgdbGame; timestamp: number }>();
  protected recommendedCache = new Map<string, { data: IgdbGame[]; timestamp: number }>();
  protected popularCache = new Map<string, { data: IgdbGame[]; timestamp: number }>();
  protected topRatedCache = new Map<string, { data: IgdbGame[]; timestamp: number }>();
  protected upcomingCache = new Map<string, { data: IgdbGame[]; timestamp: number }>();
  protected searchCache = new Map<string, { data: IgdbGame[]; timestamp: number }>();
  protected platformsCache: { data: IgdbPlatform[]; timestamp: number } | null = null;
  protected timeToBeatCache = new Map<string, { data: IgdbTimeToBeat | null; timestamp: number }>();

  constructor() {
    this.clientId = envs.services.TWITCH_CLIENT_ID;
    this.clientSecret = envs.services.TWITCH_CLIENT_SECRET;
  }

  isDlcOrExpansion(name?: string | null, slug?: string | null, category?: number): boolean {
    // IGDB Categories:
    // 0 = Main Game, 8 = Remake, 9 = Remaster.
    // 1 = DLC / Add-on, 2 = Expansion, 3 = Bundle, 4 = Standalone Expansion, 5 = Mod, 6 = Episode, 7 = Season, 10 = Expanded Game, 13 = Pack, 14 = Update.
    if (typeof category === 'number' && category !== 0 && category !== 8 && category !== 9) {
      return true;
    }

    return isForbiddenGame(name, slug, category);
  }

  protected async getAccessToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      return null;
    }

    const now = Date.now();
    if (this.accessToken && this.tokenExpiresAt > now + 60000) {
      return this.accessToken;
    }

    try {
      const res = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${this.clientId}&client_secret=${this.clientSecret}&grant_type=client_credentials`,
        { method: 'POST' }
      );

      if (!res.ok) {
        console.error('Failed to get Twitch access token for IGDB:', await res.text());
        return null;
      }

      const data = (await res.json()) as { access_token: string; expires_in: number };
      this.accessToken = data.access_token;
      this.tokenExpiresAt = now + data.expires_in * 1000;
      return this.accessToken;
    } catch (err) {
      console.error('Error fetching Twitch token for IGDB:', err);
      return null;
    }
  }

  protected formatImageUrl(
    imageId?: string,
    size: 't_cover_big' | 't_1080p' | 't_720p' | 't_screenshot_huge' = 't_cover_big'
  ): string | undefined {
    if (!imageId) return undefined;
    return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.webp`;
  }

  protected transformGame(raw: IgdbRawGame): IgdbGame {
    const coverUrl = raw.cover?.image_id
      ? this.formatImageUrl(raw.cover.image_id, 't_cover_big')
      : raw.cover?.url?.replace('t_thumb', 't_cover_big')?.replace(/^\/\//, 'https://');

    const slug = raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const adminBanner = ADMIN_GAME_BANNERS[slug] || ADMIN_GAME_BANNERS[String(raw.id)];

    // Pick admin banner, top artwork, or screenshot for 1080p banner (avoid vertical coverUrl which causes blurry stretch)
    const topArtwork = raw.artworks?.[0]?.image_id || raw.screenshots?.[0]?.image_id;
    const bannerUrl =
      adminBanner || (topArtwork ? this.formatImageUrl(topArtwork, 't_1080p') : undefined);

    const artworks =
      (raw.artworks
        ?.map((a) => this.formatImageUrl(a.image_id, 't_1080p'))
        .filter(Boolean) as string[]) || [];

    const screenshots =
      (raw.screenshots
        ?.map((s) => this.formatImageUrl(s.image_id, 't_1080p'))
        .filter(Boolean) as string[]) || [];

    const genres = raw.genres?.map((g) => g.name) || [];
    const genreIds = raw.genres?.map((g) => g.id) || [];
    const platforms = raw.platforms?.map((p) => p.name) || [];
    const gameModes = raw.game_modes?.map((mode) => mode.name) || [];

    let releaseYear: string | undefined;
    let firstReleaseDate: string | undefined;
    if (raw.first_release_date) {
      const d = new Date(raw.first_release_date * 1000);
      releaseYear = d.getFullYear().toString();
      firstReleaseDate = d.toISOString();
    }

    const developer = raw.involved_companies?.find((c) => c.developer)?.company?.name;
    const publisher = raw.involved_companies?.find((c) => c.publisher)?.company?.name;

    const similarGames: IgdbGame[] | undefined = Array.isArray(raw.similar_games)
      ? raw.similar_games
          .filter(
            (s): s is IgdbRawGame =>
              typeof s === 'object' &&
              s !== null &&
              'name' in s &&
              !this.isDlcOrExpansion(s.name, s.slug, s.category)
          )
          .map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            category: s.category,
            summary: s.summary,
            coverUrl: s.cover?.image_id
              ? this.formatImageUrl(s.cover.image_id, 't_cover_big')
              : s.cover?.url?.replace('t_thumb', 't_cover_big')?.replace(/^\/\//, 'https://'),
            genres: s.genres?.map((g) => g.name) || [],
            platforms: s.platforms?.map((p) => p.name) || [],
            releaseYear: s.first_release_date
              ? new Date(s.first_release_date * 1000).getFullYear().toString()
              : undefined,
            rating: s.rating ? Math.round(s.rating) / 20 : undefined
          }))
      : undefined;

    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: raw.category,
      summary: raw.summary,
      storyline: raw.storyline,
      coverUrl,
      bannerUrl,
      artworks,
      screenshots,
      genres,
      genreIds,
      platforms,
      gameModes,
      firstReleaseDate,
      releaseYear,
      developer,
      publisher,
      rating: raw.rating ? Math.round(raw.rating) / 20 : undefined,
      aggregatedRating: raw.aggregated_rating ? Math.round(raw.aggregated_rating) / 20 : undefined,
      similarGames
    };
  }

  /** Returns the compact platform catalogue used by discovery filters and clients. */
}
