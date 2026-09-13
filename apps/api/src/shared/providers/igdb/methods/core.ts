import { envs } from '../../../config/envs';
import { ADMIN_GAME_BANNERS } from '../../../constants/admin-banners';

export type IgdbGame = {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  coverUrl?: string;
  bannerUrl?: string;
  artworks?: string[];
  screenshots?: string[];
  genres: string[];
  platforms: string[];
  gameModes?: string[];
  firstReleaseDate?: string;
  releaseYear?: string;
  developer?: string;
  publisher?: string;
  rating?: number;
  aggregatedRating?: number;
  category?: number;
  genreIds?: number[];
  similarGames?: IgdbGame[];
  recommendedGames?: IgdbGame[];
};

export type IgdbPlatform = {
  id: number;
  name: string;
  abbreviation?: string;
};

export type IgdbTimeToBeat = {
  gameId: number;
  completely?: number;
  hastily?: number;
  normally?: number;
};

export type IgdbRawGame = {
  id: number;
  name: string;
  slug: string;
  category?: number;
  summary?: string;
  storyline?: string;
  cover?: { id: number; image_id?: string; url?: string };
  artworks?: { id: number; image_id?: string; url?: string }[];
  screenshots?: { id: number; image_id?: string; url?: string }[];
  genres?: { id: number; name: string }[];
  platforms?: { id: number; name: string; abbreviation?: string }[];
  game_modes?: { id: number; name: string }[];
  first_release_date?: number;
  rating?: number;
  aggregated_rating?: number;
  involved_companies?: {
    id: number;
    developer: boolean;
    publisher: boolean;
    company?: { id: number; name: string };
  }[];
  similar_games?: (IgdbRawGame | number)[];
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function removeSearchFillers(value: string): string {
  const fillerWords = new Set([
    'a',
    'an',
    'and',
    'da',
    'das',
    'de',
    'do',
    'dos',
    'e',
    'for',
    'in',
    'of',
    'on',
    'the',
    'to'
  ]);
  return value
    .split(' ')
    .filter((word) => word && !fillerWords.has(word))
    .join(' ');
}

export function getSearchRelevance(game: Pick<IgdbGame, 'name' | 'slug'>, query: string): number {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedName = normalizeSearchText(game.name);
  const normalizedSlug = normalizeSearchText(game.slug);
  const compactQuery = removeSearchFillers(normalizedQuery);
  const compactName = removeSearchFillers(normalizedName);

  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery || normalizedSlug === normalizedQuery) return 100;
  if (compactName === compactQuery) return 95;
  if (normalizedName.startsWith(normalizedQuery)) return 90;
  if (normalizedName.split(' ').some((word) => word.startsWith(normalizedQuery))) return 80;
  if (normalizedName.includes(normalizedQuery) || normalizedSlug.includes(normalizedQuery))
    return 70;

  if (compactQuery.length > 1 && compactName.startsWith(compactQuery)) return 85;

  return 0;
}

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

    const n = (name || '').toLowerCase();
    const s = (slug || '').toLowerCase();

    const forbiddenPatterns = [
      'game of the year',
      'goty',
      'expansion',
      'dlc',
      'season pass',
      'expansion pass',
      'deluxe edition',
      'complete edition',
      'ultimate edition',
      'gold edition',
      'silver edition',
      "collector's edition",
      'collectors edition',
      'special edition',
      'definitive edition',
      'anniversary edition',
      'enhanced edition',
      'soundtrack',
      'artbook',
      'booster pack',
      'skin pack',
      'character pack',
      'dlc pack',
      'upgrade pack',
      'bonus content',
      'add-on',
      'starter pack',
      'founders pack',
      'battle pass',
      'bundle',
      'digital soundtrack',
      'original soundtrack',
      'shadow of the erdtree'
    ];

    return forbiddenPatterns.some((pattern) => n.includes(pattern) || s.includes(pattern));
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
