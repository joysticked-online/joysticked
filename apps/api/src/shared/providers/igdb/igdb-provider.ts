import { envs } from '../../config/envs';
import { ADMIN_GAME_BANNERS } from '../../constants/admin-banners';

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

type IgdbRawGame = {
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

function normalizeSearchText(value: string): string {
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

function getSearchRelevance(game: Pick<IgdbGame, 'name' | 'slug'>, query: string): number {
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

class IgdbProvider {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private mediaCache = new Map<
    string,
    {
      coverUrl?: string;
      bannerUrl?: string;
      slug?: string;
      genres?: string[];
      platforms?: string[];
    }
  >();
  private gameDetailsCache = new Map<string, { data: IgdbGame; timestamp: number }>();
  private recommendedCache = new Map<string, { data: IgdbGame[]; timestamp: number }>();

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

  private async getAccessToken(): Promise<string | null> {
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

  private formatImageUrl(
    imageId?: string,
    size: 't_cover_big' | 't_1080p' | 't_720p' | 't_screenshot_huge' = 't_cover_big'
  ): string | undefined {
    if (!imageId) return undefined;
    return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.webp`;
  }

  private transformGame(raw: IgdbRawGame): IgdbGame {
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

  async searchGames(query: string, limit = 20): Promise<IgdbGame[]> {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return [];

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
      return rankMatches(
        rawGames
          .map((g) => this.transformGame(g))
          .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category))
      );
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
    if (!title || !title.trim()) return null;
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

  async getGameBySlugOrId(identifier: string): Promise<IgdbGame | null> {
    const cacheKey = identifier.toLowerCase().trim();
    const cached = this.gameDetailsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 1000 * 60 * 30) {
      return cached.data;
    }

    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      const fallback =
        this.getFallbackGames().find((g) => g.slug === identifier || String(g.id) === identifier) ||
        null;
      if (fallback && (!fallback.similarGames || fallback.similarGames.length === 0)) {
        fallback.similarGames = this.getGenreFallbackGames(fallback, 8);
      }
      return fallback;
    }

    try {
      const isNumeric = /^\d+$/.test(identifier);
      const whereClause = isNumeric ? `where id = ${identifier};` : `where slug = "${identifier}";`;

      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.id, genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name,
               similar_games.name, similar_games.slug, similar_games.category, similar_games.summary, similar_games.cover.image_id, similar_games.cover.url,
               similar_games.rating, similar_games.genres.name, similar_games.platforms.name, similar_games.first_release_date;
        ${whereClause}
        limit 1;
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
        return null;
      }

      let rawGames = (await res.json()) as IgdbRawGame[];
      if (!rawGames || rawGames.length === 0) {
        if (!isNumeric) {
          // If direct slug lookup had no matches (e.g. "eafc"), fallback to IGDB search
          const searchBody = `
            fields name, slug, summary, storyline, category, cover.image_id, cover.url,
                   artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
                   genres.id, genres.name, platforms.name, platforms.abbreviation, game_modes.name,
                   first_release_date, rating, aggregated_rating,
                   involved_companies.developer, involved_companies.publisher, involved_companies.company.name,
                   similar_games.name, similar_games.slug, similar_games.category, similar_games.summary, similar_games.cover.image_id, similar_games.cover.url,
                   similar_games.rating, similar_games.genres.name, similar_games.platforms.name, similar_games.first_release_date;
            search "${identifier.replace(/"/g, '')}";
            limit 1;
          `;
          const searchRes = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
              'Client-ID': this.clientId,
              Authorization: `Bearer ${token}`,
              'Content-Type': 'text/plain'
            },
            body: searchBody
          });
          if (searchRes.ok) {
            rawGames = (await searchRes.json()) as IgdbRawGame[];
          }
        }
      }

      if (!rawGames || rawGames.length === 0) {
        return null;
      }

      const transformed = this.transformGame(rawGames[0]);

      // Enrich and strictly filter similar games by genre & vibe (e.g. Sports only for sports, Cozy only for cozy)
      transformed.similarGames = await this.filterAndEnrichSimilarGames(
        transformed,
        transformed.similarGames || [],
        25
      );

      this.gameDetailsCache.set(cacheKey, { data: transformed, timestamp: Date.now() });
      if (transformed.slug) {
        this.gameDetailsCache.set(transformed.slug.toLowerCase().trim(), {
          data: transformed,
          timestamp: Date.now()
        });
      }
      this.gameDetailsCache.set(String(transformed.id), {
        data: transformed,
        timestamp: Date.now()
      });

      return transformed;
    } catch {
      return null;
    }
  }

  async filterAndEnrichSimilarGames(
    game: IgdbGame,
    rawSimilar: IgdbGame[] = [],
    limit = 25
  ): Promise<IgdbGame[]> {
    const slug = game.slug.toLowerCase();
    const name = game.name.toLowerCase();
    const genres = (game.genres || []).map((g) => g.toLowerCase());

    const isSports =
      genres.some((g) => g.includes('sport') || g.includes('corrida') || g.includes('racing')) ||
      slug.includes('fc') ||
      slug.includes('fifa') ||
      slug.includes('nba') ||
      slug.includes('f1') ||
      slug.includes('madden') ||
      slug.includes('pes') ||
      slug.includes('skate') ||
      slug.includes('wwe') ||
      name.includes('sports') ||
      name.includes('football') ||
      name.includes('soccer');

    const cozyKeywords = [
      'stardew',
      'animal-crossing',
      'farm',
      'harvest',
      'keeper',
      'coral-island',
      'slime-rancher',
      'moonlighter',
      'dave-the-diver',
      'sun-haven',
      'mistria',
      'pacha',
      'cozy',
      'unpacking',
      'potion-permit',
      'spiritfarer',
      'dorfromantik',
      'coffee-talk',
      'townscaper',
      'a-short-hike',
      'travellers-rest'
    ];

    const isCozy =
      !isSports &&
      (cozyKeywords.some((k) => slug.includes(k) || name.includes(k)) ||
        ((slug.includes('valley') || name.includes('valley')) &&
          genres.some((g) => g.includes('rpg') || g.includes('indie'))));

    if (isSports) {
      const sportsKeywords = [
        'fifa',
        'pes',
        'efootball',
        'nba',
        'nfl',
        'f1',
        'madden',
        'football',
        'soccer',
        'tennis',
        'skate',
        'hockey',
        'golf',
        'wwe',
        'wrestling',
        'racing',
        'corrida',
        'esporte',
        'sport',
        'wrc',
        'nascar',
        'nhl',
        'mlb',
        'pga',
        'pro evolution',
        'topspin',
        'rocket league',
        'gran turismo',
        'forza'
      ];

      const filtered = rawSimilar.filter((g) => {
        if (this.isDlcOrExpansion(g.name, g.slug, g.category)) return false;
        const gName = g.name.toLowerCase();
        const gSlug = g.slug.toLowerCase();
        const gGenres = (g.genres || []).map((gen) => gen.toLowerCase());
        const hasSportGenre = gGenres.some(
          (gen) =>
            gen.includes('sport') ||
            gen.includes('esporte') ||
            gen.includes('corrida') ||
            gen.includes('racing')
        );
        const hasSportKeyword = sportsKeywords.some((k) => gName.includes(k) || gSlug.includes(k));
        return (hasSportGenre || hasSportKeyword) && g.slug !== game.slug;
      });

      const fallbackSports = this.getGenreFallbackGames(game, 30);
      const existingSlugs = new Set(filtered.map((g) => g.slug));
      existingSlugs.add(game.slug);

      for (const fallback of fallbackSports) {
        if (
          !existingSlugs.has(fallback.slug) &&
          !this.isDlcOrExpansion(fallback.name, fallback.slug, fallback.category)
        ) {
          filtered.push(fallback);
          existingSlugs.add(fallback.slug);
        }
      }
      return filtered.slice(0, limit);
    }

    if (isCozy) {
      // Exclude violent, dark, or gritty games that community tags mistakenly attached to cozy games
      const nonCozyKeywords = [
        'rust',
        'police',
        'contraband',
        'morta',
        'hollow',
        'prepper',
        'witcher',
        'doom',
        'dark souls',
        'resident evil',
        'horror',
        'warfare',
        'cyberpunk',
        'grand theft',
        'bloodborne',
        'elden'
      ];

      const filtered = rawSimilar.filter((g) => {
        if (this.isDlcOrExpansion(g.name, g.slug, g.category)) return false;
        const gName = g.name.toLowerCase();
        const gSlug = g.slug.toLowerCase();
        const isExcluded = nonCozyKeywords.some((k) => gName.includes(k) || gSlug.includes(k));
        if (isExcluded) return false;
        return g.slug !== game.slug;
      });

      const fallbackCozy = this.getGenreFallbackGames(game, 30);
      const existingSlugs = new Set(filtered.map((g) => g.slug));
      existingSlugs.add(game.slug);

      for (const fallback of fallbackCozy) {
        if (
          !existingSlugs.has(fallback.slug) &&
          !this.isDlcOrExpansion(fallback.name, fallback.slug, fallback.category)
        ) {
          filtered.push(fallback);
          existingSlugs.add(fallback.slug);
        }
      }
      return filtered.slice(0, limit);
    }

    // For all other games (RPG, Action, Adventure, Shooter, etc.):
    const cleanRaw = rawSimilar.filter(
      (g) => !this.isDlcOrExpansion(g.name, g.slug, g.category) && g.slug !== game.slug
    );

    const filtered = [...cleanRaw];
    const existingSlugs = new Set(filtered.map((g) => g.slug));
    existingSlugs.add(game.slug);

    // If IGDB only returned 10 similar games, enrich with games from the same genre
    if (filtered.length < limit) {
      try {
        const genreGames = await this.queryGamesByGenre(game.genreIds || [], game.id, limit);
        for (const g of genreGames) {
          if (!existingSlugs.has(g.slug) && !this.isDlcOrExpansion(g.name, g.slug, g.category)) {
            filtered.push(g);
            existingSlugs.add(g.slug);
          }
        }
      } catch (err) {
        console.warn('Error querying genre games in filterAndEnrichSimilarGames:', err);
      }
    }

    // If still under limit, backfill with curated genre-appropriate titles
    if (filtered.length < limit) {
      const fallbackList = this.getGenreFallbackGames(game, 30);
      for (const f of fallbackList) {
        if (!existingSlugs.has(f.slug) && !this.isDlcOrExpansion(f.name, f.slug, f.category)) {
          filtered.push(f);
          existingSlugs.add(f.slug);
        }
      }
    }

    return filtered.slice(0, limit);
  }

  async getRecommendedGames(game: IgdbGame, limit = 8): Promise<IgdbGame[]> {
    const recCacheKey = `${game.slug.toLowerCase()}_${limit}`;
    const cachedRec = this.recommendedCache.get(recCacheKey);
    if (cachedRec && Date.now() - cachedRec.timestamp < 1000 * 60 * 30) {
      return cachedRec.data;
    }

    const slug = game.slug.toLowerCase();
    const name = game.name.toLowerCase();
    const genres = (game.genres || []).map((g) => g.toLowerCase());

    const isSports =
      genres.some((g) => g.includes('sport') || g.includes('corrida') || g.includes('racing')) ||
      slug.includes('fc') ||
      slug.includes('fifa') ||
      slug.includes('nba') ||
      slug.includes('f1') ||
      slug.includes('madden') ||
      slug.includes('pes') ||
      slug.includes('skate') ||
      slug.includes('wwe') ||
      name.includes('sports') ||
      name.includes('football') ||
      name.includes('soccer');

    const cozyKeywords = [
      'stardew',
      'animal-crossing',
      'farm',
      'harvest',
      'keeper',
      'coral-island',
      'slime-rancher',
      'moonlighter',
      'dave-the-diver',
      'sun-haven',
      'mistria',
      'pacha',
      'cozy',
      'unpacking',
      'potion-permit',
      'spiritfarer',
      'dorfromantik',
      'coffee-talk',
      'townscaper',
      'a-short-hike',
      'travellers-rest'
    ];

    const isCozy =
      !isSports &&
      (cozyKeywords.some((k) => slug.includes(k) || name.includes(k)) ||
        ((slug.includes('valley') || name.includes('valley')) &&
          genres.some((g) => g.includes('rpg') || g.includes('indie'))));

    let finalRecs: IgdbGame[] = [];

    // For sports and cozy games, return strictly tailored curated suggestions
    if (isSports || isCozy) {
      finalRecs = this.getGenreFallbackGames(game, limit);
    } else {
      const genreIds = game.genreIds || [];
      const results = await this.queryGamesByGenre(genreIds, game.id, limit);

      if (results.length > 0) {
        finalRecs = results;
      } else {
        finalRecs = this.getGenreFallbackGames(game, limit);
      }
    }

    this.recommendedCache.set(recCacheKey, { data: finalRecs, timestamp: Date.now() });
    return finalRecs;
  }

  private async queryGamesByGenre(
    genreIds: number[],
    excludeId: number | string,
    limit = 8
  ): Promise<IgdbGame[]> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId || genreIds.length === 0) {
      return [];
    }

    try {
      // Prioritize specific defining genres (Sport: 14, Racing: 10, Simulator: 13, Shooter: 5, etc.)
      // over generic RPG (12) or Adventure (31)
      const PRIORITY_GENRES = [14, 10, 13, 5, 4, 9, 15, 32];
      const targetGenre = genreIds.find((id) => PRIORITY_GENRES.includes(id)) || genreIds[0];

      const body = `
        fields name, slug, summary, category, cover.image_id, cover.url,
               genres.id, genres.name, platforms.name, game_modes.name, first_release_date, rating;
        where genres = (${targetGenre}) & id != ${excludeId} & cover != null & category = (0, 8, 9) & rating > 70;
        sort rating desc;
        limit ${limit};
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

      if (res.ok) {
        const raw = (await res.json()) as IgdbRawGame[];
        if (Array.isArray(raw) && raw.length > 0) {
          return raw
            .map((r) => this.transformGame(r))
            .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category));
        }
      }
    } catch (err) {
      console.warn('Error querying games by genre from IGDB:', err);
    }

    return [];
  }

  getGenreFallbackGames(game: IgdbGame, limit = 25): IgdbGame[] {
    const slug = game.slug.toLowerCase();
    const name = game.name.toLowerCase();
    const genres = (game.genres || []).map((g) => g.toLowerCase());

    const isSports =
      genres.some((g) => g.includes('sport') || g.includes('corrida') || g.includes('racing')) ||
      slug.includes('fc') ||
      slug.includes('fifa') ||
      slug.includes('nba') ||
      slug.includes('f1') ||
      slug.includes('madden') ||
      slug.includes('pes') ||
      slug.includes('skate') ||
      slug.includes('wwe') ||
      name.includes('sports') ||
      name.includes('football') ||
      name.includes('soccer');

    const cozyKeywords = [
      'stardew',
      'animal-crossing',
      'farm',
      'harvest',
      'keeper',
      'coral-island',
      'slime-rancher',
      'moonlighter',
      'dave-the-diver',
      'sun-haven',
      'mistria',
      'pacha',
      'cozy',
      'unpacking',
      'potion-permit',
      'spiritfarer',
      'dorfromantik',
      'coffee-talk',
      'townscaper',
      'a-short-hike',
      'travellers-rest'
    ];

    const isCozy =
      !isSports &&
      (cozyKeywords.some((k) => slug.includes(k) || name.includes(k)) ||
        ((slug.includes('valley') || name.includes('valley')) &&
          genres.some((g) => g.includes('rpg') || g.includes('indie'))));

    const isShooter =
      genres.some((g) => g.includes('shooter')) ||
      slug.includes('duty') ||
      slug.includes('apex') ||
      slug.includes('doom') ||
      slug.includes('cyberpunk');

    if (isSports) {
      return [
        {
          id: 3001,
          name: 'EA SPORTS FC 24',
          slug: 'ea-sports-fc-24',
          summary: 'O Jogo de Todo Mundo trazendo o futebol mais realista do planeta.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6q78.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.2
        },
        {
          id: 3002,
          name: 'eFootball 2024',
          slug: 'efootball-2024',
          summary: 'Uma nova era de futebol virtual da Konami para os amantes do esporte.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co71c3.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 3.8
        },
        {
          id: 3003,
          name: 'NBA 2K24',
          slug: 'nba-2k24',
          summary:
            'Experimente a cultura do basquete com realismo inovador e o legado de Kobe Bryant.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6r00.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.0
        },
        {
          id: 3004,
          name: 'Rocket League',
          slug: 'rocket-league',
          summary: 'Futebol com carros movidos a foguete em alta octanagem.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5176.webp',
          genres: ['Esporte', 'Ação'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2015',
          rating: 4.6
        },
        {
          id: 3005,
          name: 'F1 24',
          slug: 'f1-24',
          summary:
            'Sinta-se mais próximo do grid do que nunca no jogo oficial do Campeonato de Fórmula 1.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co835b.webp',
          genres: ['Corrida', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2024',
          rating: 4.3
        },
        {
          id: 3006,
          name: 'TopSpin 2K25',
          slug: 'topspin-2k25',
          summary: 'O clássico do tênis retorna com lendas do esporte e partidas intensas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co811o.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2024',
          rating: 4.1
        },
        {
          id: 3007,
          name: "Tony Hawk's Pro Skater 1 + 2",
          slug: 'tony-hawks-pro-skater-1-plus-2',
          summary: 'Reviva as manobras e a trilha sonora épica do skate nos remakes definitivos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co204m.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.8
        },
        {
          id: 3008,
          name: 'WWE 2K24',
          slug: 'wwe-2k24',
          summary:
            'Celebre 40 anos de WrestleMania com os maiores combates da história do wrestling.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v5k.webp',
          genres: ['Esporte', 'Luta'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2024',
          rating: 4.2
        },
        {
          id: 3009,
          name: 'FIFA 23',
          slug: 'fifa-23',
          summary: 'A tecnologia HyperMotion2 leva o Maior Jogo do Mundo aos gramados virtuais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co50a6.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.1
        },
        {
          id: 3010,
          name: 'Madden NFL 24',
          slug: 'madden-nfl-24',
          summary: 'O controle tático do futebol americano com a evolução do FieldSENSE.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6qg8.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 3.9
        },
        {
          id: 3011,
          name: 'Gran Turismo 7',
          slug: 'gran-turismo-7',
          summary: 'O simulador de corrida real definitivo com mais de 400 carros lendários.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co49x5.webp',
          genres: ['Corrida', 'Simulador'],
          platforms: ['PlayStation 5', 'PlayStation 4'],
          releaseYear: '2022',
          rating: 4.7
        },
        {
          id: 3012,
          name: 'Forza Horizon 5',
          slug: 'forza-horizon-5',
          summary:
            'Explore as paisagens vibrantes do México em um festival automobilístico aberto sem limites.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3ofw.webp',
          genres: ['Corrida', 'Aventura'],
          platforms: ['PC', 'Xbox Series X|S', 'Xbox One'],
          releaseYear: '2021',
          rating: 4.8
        },
        {
          id: 3013,
          name: 'Football Manager 2024',
          slug: 'football-manager-2024',
          summary:
            'Construa uma equipe de nível mundial e lidere seu clube à glória absoluta no futebol.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co759r.webp',
          genres: ['Simulador', 'Estratégia', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.5
        },
        {
          id: 3014,
          name: 'Riders Republic',
          slug: 'riders-republic',
          summary:
            'Salte no imenso parque esportivo multiplayer com esqui, snowboard, bike e wingsuit.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k3e.webp',
          genres: ['Esporte', 'Corrida'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2021',
          rating: 4.2
        },
        {
          id: 3015,
          name: 'Skate 3',
          slug: 'skate-3',
          summary: 'O ápice da física e das manobras cooperativas de skate em Port Carverton.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x9a.webp',
          genres: ['Esporte'],
          platforms: ['PlayStation 3', 'Xbox 360'],
          releaseYear: '2010',
          rating: 4.6
        },
        {
          id: 3016,
          name: 'PGA TOUR 2K23',
          slug: 'pga-tour-2k23',
          summary:
            'Leve suas tacadas para o PGA TOUR e dispute contra profissionais do golfe mundial.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co580e.webp',
          genres: ['Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.1
        },
        {
          id: 3017,
          name: 'Tennis World Tour 2',
          slug: 'tennis-world-tour-2',
          summary:
            'Jogue como os maiores tenistas do mundo ou crie seu próprio atleta para dominar o ranking.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2k1o.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.0
        },
        {
          id: 3018,
          name: 'NHL 24',
          slug: 'nhl-24',
          summary:
            'Sinta toda a intensidade do hóquei no gelo com a nova Exhaust Engine da EA SPORTS.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co72f3.webp',
          genres: ['Esporte'],
          platforms: ['PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.2
        },
        {
          id: 3019,
          name: 'MLB The Show 24',
          slug: 'mlb-the-show-24',
          summary: 'Viva seus sonhos de beisebol com momentos decisivos e lendas da MLB.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7s8q.webp',
          genres: ['Esporte'],
          platforms: ['PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2024',
          rating: 4.4
        },
        {
          id: 3020,
          name: 'WRC Generations',
          slug: 'wrc-generations',
          summary: 'Encare todos os desafios do rali mais completo e realista já criado.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52a7.webp',
          genres: ['Corrida', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.3
        },
        {
          id: 3021,
          name: 'Session: Skate Sim',
          slug: 'session-skate-sim',
          summary:
            'Feito por e para skatistas, experimente o controle duplo com os analógicos para manobras ultra precisas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co50a7.webp',
          genres: ['Simulador', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2022',
          rating: 4.2
        },
        {
          id: 3022,
          name: 'AO Tennis 2',
          slug: 'ao-tennis-2',
          summary:
            'O jogo de tênis oficial do Australian Open com modo carreira profundo e criação de quadras.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xcr.webp',
          genres: ['Esporte'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.1
        },
        {
          id: 3023,
          name: 'DIRT 5',
          slug: 'dirt-5',
          summary: 'Corridas off-road cheias de estilo, adrenalina e pistas dinâmicas pelo mundo.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co204b.webp',
          genres: ['Corrida', 'Esporte'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.3
        },
        {
          id: 3024,
          name: 'Ride 5',
          slug: 'ride-5',
          summary:
            'Acelere seu motor e sinta a emoção de pilotar as motocicletas mais desejadas da história.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6qg9.webp',
          genres: ['Corrida', 'Esporte', 'Simulador'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.2
        }
      ].slice(0, limit);
    }

    if (isCozy) {
      return [
        {
          id: 4001,
          name: 'Animal Crossing: New Horizons',
          slug: 'animal-crossing-new-horizons',
          summary:
            'Escape para uma ilha deserta e crie seu próprio paraíso nesta experiência relaxante.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co72i4.webp',
          genres: ['Simulador', 'Aventura'],
          platforms: ['Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.9
        },
        {
          id: 4002,
          name: 'Graveyard Keeper',
          slug: 'graveyard-keeper',
          summary: 'A simulação de gerenciamento de cemitério medieval mais imprecisa do ano.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xcr.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2018',
          rating: 4.4
        },
        {
          id: 4003,
          name: 'Dave the Diver',
          slug: 'dave-the-diver',
          summary:
            'Explore o mar durante o dia e administre um restaurante de sushi movimentado à noite.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t84.webp',
          genres: ['Aventura', 'Simulador', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          releaseYear: '2023',
          rating: 4.8
        },
        {
          id: 4004,
          name: 'Slime Rancher 2',
          slug: 'slime-rancher-2',
          summary:
            'Continue as aventuras de Beatrix LeBeau ao viajar pela Rainbow Island criando slimes adoráveis.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5q42.webp',
          genres: ['Aventura', 'Indie', 'Simulador'],
          platforms: ['PC', 'Xbox Series X|S', 'PlayStation 5'],
          releaseYear: '2022',
          rating: 4.6
        },
        {
          id: 4005,
          name: 'Coral Island',
          slug: 'coral-island',
          summary:
            'Construa sua fazenda dos sonhos, cuide dos animais e restaure recifes de corais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7j3g.webp',
          genres: ['Simulador', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2023',
          rating: 4.5
        },
        {
          id: 4006,
          name: 'Moonlighter',
          slug: 'moonlighter',
          summary:
            'Um RPG de ação com elementos rogue-lite sobre a rotina de Will, um lojista corajoso.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1mbi.webp',
          genres: ['RPG', 'Indie', 'Aventura'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2018',
          rating: 4.3
        },
        {
          id: 4007,
          name: 'Sun Haven',
          slug: 'sun-haven',
          summary:
            'Crie sua fazenda e construa relacionamentos com moradores nesta vila mágica cheia de fantasia.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co69p2.webp',
          genres: ['RPG', 'Simulador', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2023',
          rating: 4.6
        },
        {
          id: 4008,
          name: 'Terraria',
          slug: 'terraria',
          summary:
            'Cave, lute, explore e construa neste jogo de aventura sandbox 2D aclamado no mundo todo.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.webp',
          genres: ['Aventura', 'Indie', 'Plataforma'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2011',
          rating: 4.9
        },
        {
          id: 4009,
          name: 'Roots of Pacha',
          slug: 'roots-of-pacha',
          summary:
            'Uma simulação de fazenda e vida comunitária acolhedora ambientada na Idade da Pedra.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co69f2.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          releaseYear: '2023',
          rating: 4.7
        },
        {
          id: 4010,
          name: 'Cozy Grove',
          slug: 'cozy-grove',
          summary:
            'Explore uma ilha assombrada e traga cor e vida aos fantasmas fofos dos ursos locais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2w6a.webp',
          genres: ['Aventura', 'Simulador', 'Indie'],
          platforms: ['PC', 'PlayStation 4', 'Nintendo Switch'],
          releaseYear: '2021',
          rating: 4.5
        },
        {
          id: 4011,
          name: 'Unpacking',
          slug: 'unpacking',
          summary: 'Um jogo zen sobre desempacotar caixas e montar lares através dos anos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3w6x.webp',
          genres: ['Quebra-cabeça', 'Indie'],
          platforms: ['PC', 'PlayStation 5', 'Nintendo Switch'],
          releaseYear: '2021',
          rating: 4.8
        },
        {
          id: 4012,
          name: 'Spiritfarer',
          slug: 'spiritfarer',
          summary:
            'Um jogo de gerenciamento acolhedor sobre a morte e a despedida de amigos queridos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co22b8.webp',
          genres: ['Aventura', 'Simulador', 'Indie'],
          platforms: ['PC', 'PlayStation 4', 'Nintendo Switch'],
          releaseYear: '2020',
          rating: 4.9
        },
        {
          id: 4013,
          name: 'Dorfromantik',
          slug: 'dorfromantik',
          summary:
            'Construa paisagens rurais pacíficas e crie aldeias idílicas colocando ladrilhos hexagonais.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3i06.webp',
          genres: ['Estratégia', 'Quebra-cabeça', 'Indie'],
          platforms: ['PC', 'Nintendo Switch'],
          releaseYear: '2022',
          rating: 4.7
        },
        {
          id: 4014,
          name: 'A Short Hike',
          slug: 'a-short-hike',
          summary:
            'Caminhe, voe e suba montanhas relaxantes neste mundinho encantador e aconchegante.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xbt.webp',
          genres: ['Aventura', 'Indie'],
          platforms: ['PC', 'Nintendo Switch', 'PlayStation 4'],
          releaseYear: '2019',
          rating: 4.8
        },
        {
          id: 4015,
          name: 'Ooblets',
          slug: 'ooblets',
          summary:
            'Cultive criaturinhas fofas, participe de batalhas de dança e gerencie sua fazendinha.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52b9.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2022',
          rating: 4.6
        },
        {
          id: 4016,
          name: 'Wylde Flowers',
          slug: 'wylde-flowers',
          summary:
            'Junte-se a Tara em uma jornada mágica para se tornar uma bruxa acolhedora em sua fazenda.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4x4b.webp',
          genres: ['Simulador', 'Aventura', 'Indie'],
          platforms: ['PC', 'Nintendo Switch', 'Apple Arcade'],
          releaseYear: '2022',
          rating: 4.8
        },
        {
          id: 4017,
          name: 'Fae Farm',
          slug: 'fae-farm',
          summary: 'Escape para o mundo mágico de Azoria e construa seu lar de fadas com amigos.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co69f3.webp',
          genres: ['RPG', 'Simulador'],
          platforms: ['PC', 'Nintendo Switch', 'PlayStation 5'],
          releaseYear: '2023',
          rating: 4.3
        },
        {
          id: 4018,
          name: 'Dinkum',
          slug: 'dinkum',
          summary:
            'Comece uma nova vida relaxante no outback australiano construindo sua cidade e fazenda.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co50a8.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2022',
          rating: 4.7
        },
        {
          id: 4019,
          name: 'Rune Factory 4 Special',
          slug: 'rune-factory-4-special',
          summary:
            'O clássico RPG de vida no campo, cultivo e relacionamentos mágicos remasterizado.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7e.webp',
          genres: ['RPG', 'Simulador'],
          platforms: ['PC', 'Nintendo Switch', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2019',
          rating: 4.6
        },
        {
          id: 4020,
          name: 'My Time at Sandrock',
          slug: 'my-time-at-sandrock',
          summary:
            'Viaje para a comunidade desértica de Sandrock e ajude a cidade a prosperar como construtor.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6r01.webp',
          genres: ['RPG', 'Simulador', 'Aventura'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2023',
          rating: 4.7
        },
        {
          id: 4021,
          name: 'Slime Rancher',
          slug: 'slime-rancher',
          summary: 'Explore um planeta colorido e alienígena criando slimes alegres e pulitantes.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xcr.webp',
          genres: ['Aventura', 'Indie', 'Simulador'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
          releaseYear: '2017',
          rating: 4.8
        },
        {
          id: 4022,
          name: 'Kynseed',
          slug: 'kynseed',
          summary:
            'Um sandbox RPG 2D feito por ex-desenvolvedores de Fable com ciclos de vida e fazenda.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co52b8.webp',
          genres: ['RPG', 'Simulador', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2022',
          rating: 4.4
        },
        {
          id: 4023,
          name: 'Travellers Rest',
          slug: 'travellers-rest',
          summary:
            'Gerencie sua própria taverna medieval aconchegante, produza cervejas e cultive ingredientes.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co204c.webp',
          genres: ['Simulador', 'RPG', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2020',
          rating: 4.6
        }
      ].slice(0, limit);
    }

    if (isShooter) {
      const shooterGames: IgdbGame[] = [
        {
          id: 5001,
          name: 'Doom Eternal',
          slug: 'doom-eternal',
          summary:
            'Os exércitos do inferno invadiram a Terra. Torne-se o Slayer e destrua os demônios.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co29be.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.8
        },
        {
          id: 5002,
          name: 'Titanfall 2',
          slug: 'titanfall-2',
          summary:
            'Piloto e Titã se unem como nunca nesta obra-prima do FPS com mobilidade sem igual.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xbo.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2016',
          rating: 4.9
        },
        {
          id: 5003,
          name: 'Apex Legends',
          slug: 'apex-legends',
          summary:
            'Domine um elenco crescente de lendas com habilidades poderosas nesta batalha estratégica.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2044.webp',
          genres: ['Tiro (Shooter)', 'Ação'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.5
        },
        {
          id: 5004,
          name: 'Destiny 2',
          slug: 'destiny-2',
          summary: 'Mergulhe no mundo de Destiny 2 para explorar os mistérios do sistema solar.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t98.webp',
          genres: ['Tiro (Shooter)', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2017',
          rating: 4.4
        },
        {
          id: 5005,
          name: 'Halo Infinite',
          slug: 'halo-infinite',
          summary: 'O Master Chief retorna na maior aventura e campanha da icônica franquia Halo.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co214o.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'Xbox Series X|S', 'Xbox One'],
          releaseYear: '2021',
          rating: 4.3
        },
        {
          id: 5006,
          name: 'Overwatch 2',
          slug: 'overwatch-2',
          summary: 'Heróis lendários em confrontos 5v5 cheios de ação e estratégia.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4t4b.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S', 'Nintendo Switch'],
          releaseYear: '2022',
          rating: 4.1
        },
        {
          id: 5007,
          name: "Tom Clancy's Rainbow Six Siege",
          slug: 'tom-clancys-rainbow-six-siege',
          summary:
            'O clássico combate tático em equipe com operadores especializados e destruição de ambientes.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rc7.webp',
          genres: ['Tiro (Shooter)', 'Tático'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2015',
          rating: 4.6
        },
        {
          id: 5008,
          name: 'Counter-Strike 2',
          slug: 'counter-strike-2',
          summary: 'O maior avanço técnico na história da lendária série de tiro tático da Valve.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co695g.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC'],
          releaseYear: '2023',
          rating: 4.7
        },
        {
          id: 5009,
          name: 'BioShock Infinite',
          slug: 'bioshock-infinite',
          summary:
            'Voe para a cidade flutuante de Columbia em um clássico conto de mistério e ação frenética.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1xbc.webp',
          genres: ['Tiro (Shooter)', 'Aventura'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2013',
          rating: 4.9
        },
        {
          id: 5010,
          name: 'Metro Exodus',
          slug: 'metro-exodus',
          summary:
            'Fuja das ruínas do metrô de Moscou em uma jornada pós-apocalíptica pela imensidão russa.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1m1z.webp',
          genres: ['Tiro (Shooter)', 'Ação'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.7
        },
        {
          id: 5011,
          name: 'Deep Rock Galactic',
          slug: 'deep-rock-galactic',
          summary:
            'Anões espaciais badass, cavernas 100% destrutíveis e hordas infinitas de monstros alienígenas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2jvd.webp',
          genres: ['Tiro (Shooter)', 'Indie'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2020',
          rating: 4.8
        },
        {
          id: 5012,
          name: 'Borderlands 3',
          slug: 'borderlands-3',
          summary:
            'O rei dos looter-shooters com bilhões de armas extravagantes e caos interplanetário.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1s4c.webp',
          genres: ['Tiro (Shooter)', 'RPG'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.4
        },
        {
          id: 5013,
          name: 'Hunt: Showdown',
          slug: 'hunt-showdown',
          summary: 'PvPvE de alta tensão e terror sobrenatural nos pântanos sombrios da Louisiana.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1ndb.webp',
          genres: ['Tiro (Shooter)'],
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
          releaseYear: '2019',
          rating: 4.6
        },
        {
          id: 5014,
          name: 'Wolfenstein II: The New Colossus',
          slug: 'wolfenstein-ii-the-new-colossus',
          summary:
            'Lidere a segunda Revolução Americana contra o regime opressor nesta campanha épica.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rb8.webp',
          genres: ['Tiro (Shooter)', 'Ação'],
          platforms: ['PC', 'PlayStation 4', 'Xbox One'],
          releaseYear: '2017',
          rating: 4.7
        },
        {
          id: 5015,
          name: 'ULTRAKILL',
          slug: 'ultrakill',
          summary:
            'Um retro-FPS ultra veloz e brutal movido a sangue e habilidades de combo acrobáticas.',
          coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co22q2.webp',
          genres: ['Tiro (Shooter)', 'Indie'],
          platforms: ['PC'],
          releaseYear: '2020',
          rating: 4.9
        }
      ];
      return shooterGames
        .filter((g) => g.slug !== game.slug && !this.isDlcOrExpansion(g.name, g.slug, g.category))
        .slice(0, limit);
    }

    // Default RPG / Adventure / Souls
    const defaultGames: IgdbGame[] = [
      {
        id: 119133,
        name: 'Dark Souls III',
        slug: 'dark-souls-iii',
        summary:
          'Enquanto o fogo se apaga e o mundo cai em ruínas, viaje para um universo repleto de inimigos colossais.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2016',
        rating: 4.8
      },
      {
        id: 119134,
        name: 'Bloodborne',
        slug: 'bloodborne',
        summary: 'Enfrente seus medos enquanto busca respostas na antiga cidade de Yharnam.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rba.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PlayStation 4'],
        releaseYear: '2015',
        rating: 4.9
      },
      {
        id: 119135,
        name: 'Sekiro: Shadows Die Twice',
        slug: 'sekiro-shadows-die-twice',
        summary:
          'Trace seu próprio caminho para a vingança nesta aventura premiada da FromSoftware.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1rbu.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2019',
        rating: 4.9
      },
      {
        id: 119136,
        name: 'Lies of P',
        slug: 'lies-of-p',
        summary:
          'Um soulslike emocionante que adapta a história de Pinóquio em uma cidade sombria da Belle Époque.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6p64.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.7
      },
      {
        id: 125174,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        summary: 'Reúna seu grupo e retorne aos Forgotten Realms em um RPG revolucionário.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        genres: ['Role-playing (RPG)', 'Estratégia'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.9
      },
      {
        id: 119137,
        name: 'Monster Hunter: World',
        slug: 'monster-hunter-world',
        summary:
          'Cace monstros majestosos em ecossistemas vivos e use seus despojos para forjar equipamentos lendários.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1iqo.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2018',
        rating: 4.7
      },
      {
        id: 119138,
        name: 'Elden Ring',
        slug: 'elden-ring',
        summary:
          'Levante-se, Maculado, e seja guiado pela graça para brandir o poder do Anel Prístino.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2022',
        rating: 4.9
      },
      {
        id: 119139,
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        summary:
          'Torne-se Geralt de Rívia, um caçador de monstros profissional em busca da Criança da Profecia.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2015',
        rating: 4.9
      },
      {
        id: 119140,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        summary: 'Torne-se um mercenário urbano fora da lei na megalópole futurista de Night City.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8175.webp',
        genres: ['Role-playing (RPG)', 'Tiro (Shooter)'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2020',
        rating: 4.6
      },
      {
        id: 119141,
        name: 'God of War Ragnarök',
        slug: 'god-of-war-ragnarok',
        summary:
          'Kratos e Atreus embarcam em uma jornada mítica por respostas antes da batalha profetizada.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PlayStation 5', 'PlayStation 4', 'PC'],
        releaseYear: '2022',
        rating: 4.9
      },
      {
        id: 119142,
        name: 'Ghost of Tsushima',
        slug: 'ghost-of-tsushima',
        summary:
          'Forje um novo caminho e trave uma guerra não convencional pela liberdade de Tsushima.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2765.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'PlayStation 4'],
        releaseYear: '2020',
        rating: 4.9
      },
      {
        id: 119143,
        name: 'Horizon Zero Dawn',
        slug: 'horizon-zero-dawn',
        summary:
          'Viva a lendária jornada de Aloy para desvendar os mistérios de uma Terra dominada por Máquinas.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2vv5.webp',
        genres: ['Ação', 'Role-playing (RPG)'],
        platforms: ['PC', 'PlayStation 4', 'PlayStation 5'],
        releaseYear: '2017',
        rating: 4.7
      },
      {
        id: 119144,
        name: 'Red Dead Redemption 2',
        slug: 'red-dead-redemption-2',
        summary:
          'A épica história de Arthur Morgan e da gangue Van der Linde no crepúsculo do Velho Oeste.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
        genres: ['Aventura', 'Ação'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One'],
        releaseYear: '2018',
        rating: 4.9
      },
      {
        id: 119145,
        name: 'Final Fantasy VII Remake',
        slug: 'final-fantasy-vii-remake',
        summary: 'Uma reimaginação espetacular do icônico RPG que definiu uma era dos videogames.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r83.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 5', 'PlayStation 4'],
        releaseYear: '2020',
        rating: 4.8
      },
      {
        id: 119146,
        name: "Dragon's Dogma 2",
        slug: 'dragons-dogma-2',
        summary:
          'Um RPG de ação narrativa onde os jogadores moldam sua própria jornada com peões leais.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t8s.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2024',
        rating: 4.5
      },
      {
        id: 119147,
        name: 'Persona 5 Royal',
        slug: 'persona-5-royal',
        summary:
          'Coloque a máscara dos Phantom Thieves e realize assaltos épicos nos corações dos corruptos.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1nic.webp',
        genres: ['Role-playing (RPG)'],
        platforms: ['PC', 'PlayStation 5', 'Nintendo Switch', 'Xbox Series X|S'],
        releaseYear: '2019',
        rating: 4.9
      },
      {
        id: 119148,
        name: 'NieR:Automata',
        slug: 'nier-automata',
        summary:
          'Os androides 2B, 9S e A2 lutam para recuperar uma distopia abandonada pela humanidade.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r84.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2017',
        rating: 4.9
      },
      {
        id: 119149,
        name: 'The Elder Scrolls V: Skyrim',
        slug: 'the-elder-scrolls-v-skyrim',
        summary:
          'O clássico RPG de mundo aberto definitivo onde você pode ser quem quiser e fazer o que desejar.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1tnw.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2011',
        rating: 4.8
      },
      {
        id: 119150,
        name: 'Black Myth: Wukong',
        slug: 'black-myth-wukong',
        summary: 'Um RPG de ação enraizado na mitologia chinesa baseado em Jornada ao Oeste.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s8l.webp',
        genres: ['Ação', 'Role-playing (RPG)'],
        platforms: ['PC', 'PlayStation 5'],
        releaseYear: '2024',
        rating: 4.8
      },
      {
        id: 119151,
        name: 'Armored Core VI: Fires of Rubicon',
        slug: 'armored-core-vi-fires-of-rubicon',
        summary:
          'Batalhas mecha em alta velocidade com pilotagem tridimensional e montagens personalizadas.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6u2b.webp',
        genres: ['Ação', 'Simulador'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.7
      },
      {
        id: 119152,
        name: 'Star Wars Jedi: Survivor',
        slug: 'star-wars-jedi-survivor',
        summary:
          'A história de Cal Kestis continua em um combate cinematográfico através da galáxia.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co655w.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2023',
        rating: 4.6
      },
      {
        id: 119153,
        name: 'Kingdom Come: Deliverance',
        slug: 'kingdom-come-deliverance',
        summary:
          'Um RPG imersivo em primeira pessoa ambientado no Sacro Império Romano da Idade Média.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8c.webp',
        genres: ['Role-playing (RPG)', 'Aventura'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2018',
        rating: 4.6
      },
      {
        id: 119154,
        name: 'Death Stranding',
        slug: 'death-stranding',
        summary:
          'Reconecte uma sociedade despedaçada em uma experiência inovadora de mundo aberto de Hideo Kojima.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1s9v.webp',
        genres: ['Ação', 'Aventura'],
        platforms: ['PC', 'PlayStation 5', 'PlayStation 4'],
        releaseYear: '2019',
        rating: 4.7
      },
      {
        id: 119155,
        name: "Demon's Souls",
        slug: 'demons-souls',
        summary:
          'O remake impecável do clássico de fantasia sombria e combate impiedoso no reino de Boletaria.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2e0y.webp',
        genres: ['Role-playing (RPG)', 'Ação'],
        platforms: ['PlayStation 5'],
        releaseYear: '2020',
        rating: 4.8
      },
      {
        id: 119156,
        name: 'Hollow Knight',
        slug: 'hollow-knight',
        summary:
          'Explore um vasto reino arruinado de insetos e heróis neste aclamado metroidvania.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co9505.webp',
        genres: ['Aventura', 'Plataforma', 'Indie'],
        platforms: ['PC', 'PlayStation 4', 'Xbox One', 'Nintendo Switch'],
        releaseYear: '2017',
        rating: 4.9
      }
    ];
    return defaultGames
      .filter((g) => g.slug !== game.slug && !this.isDlcOrExpansion(g.name, g.slug, g.category))
      .slice(0, limit);
  }

  async getPopularGames(limit = 12): Promise<IgdbGame[]> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return this.getFallbackGames().slice(0, limit);
    }

    try {
      const fetchLimit = Math.max(limit * 2, 30);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating, rating_count,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where rating_count > 100 & cover != null;
        sort rating_count desc;
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

      return transformed.slice(0, limit);
    } catch (err) {
      console.error('Error fetching popular games from IGDB:', err);
      return this.getFallbackGames().slice(0, limit);
    }
  }

  async getTopRatedGames(limit = 6): Promise<IgdbGame[]> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return this.getFallbackGames().slice(0, limit);
    }

    try {
      const fetchLimit = Math.max(limit * 3, 25);
      const body = `
        fields name, slug, summary, storyline, category, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation, game_modes.name,
               first_release_date, rating, aggregated_rating, rating_count,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where rating_count > 500 & cover != null;
        sort rating desc;
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

      return filtered.slice(0, limit);
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
    const upcomingFallbacks: IgdbGame[] = [
      {
        id: 119171,
        name: 'Grand Theft Auto VI',
        slug: 'grand-theft-auto-vi',
        summary:
          'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v2e.webp',
        genres: ['Action', 'Adventure', 'Shooter'],
        platforms: ['PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2025'
      },
      {
        id: 279555,
        name: 'Monster Hunter Wilds',
        slug: 'monster-hunter-wilds',
        summary:
          'The next generation in the Monster Hunter series. Experience seamless gameplay and dynamic living ecosystems.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8352.webp',
        genres: ['Action', 'Role-playing (RPG)', 'Adventure'],
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2025'
      },
      {
        id: 301294,
        name: 'DOOM: The Dark Ages',
        slug: 'doom-the-dark-ages',
        summary:
          'The prequel to the critically acclaimed DOOM (2016) and DOOM Eternal. Witness the origin of the Doom Slayer rage.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8g92.webp',
        genres: ['Shooter', 'Action'],
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2025'
      },
      {
        id: 228498,
        name: 'Death Stranding 2: On The Beach',
        slug: 'death-stranding-2-on-the-beach',
        summary:
          'Embark on an inspiring mission of human connection beyond the UCA. Sam with companions sets out on a new journey to save humanity from extinction.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7rqp.webp',
        genres: ['Action', 'Adventure'],
        platforms: ['PlayStation 5'],
        releaseYear: '2025'
      }
    ];

    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return upcomingFallbacks.slice(0, limit);
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
        return upcomingFallbacks.slice(0, limit);
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      const filtered = rawGames
        .map((g) => this.transformGame(g))
        .filter((g) => !this.isDlcOrExpansion(g.name, g.slug, g.category));

      if (filtered.length < limit) {
        for (const f of upcomingFallbacks) {
          if (!filtered.some((x) => x.slug === f.slug)) {
            filtered.push(f);
          }
        }
      }

      return filtered.slice(0, limit);
    } catch {
      return upcomingFallbacks.slice(0, limit);
    }
  }

  private getFallbackGames(): IgdbGame[] {
    return [
      {
        id: 119133,
        name: 'Elden Ring',
        slug: 'elden-ring',
        summary:
          'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
        storyline:
          'In the Lands Between ruled by Queen Marika the Eternal, the Elden Ring, the source of the Erdtree, has been shattered.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.webp',
        genres: ['Role-playing (RPG)', 'Adventure'],
        platforms: [
          'PC (Microsoft Windows)',
          'PlayStation 5',
          'Xbox Series X|S',
          'PlayStation 4',
          'Xbox One'
        ],
        releaseYear: '2022',
        developer: 'FromSoftware',
        publisher: 'Bandai Namco Entertainment',
        rating: 4.9
      },
      {
        id: 125174,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        summary:
          "An ancient evil has returned to Baldur's Gate, intent on devouring it from the inside out. The fate of the Forgotten Realms lies in your hands.",
        storyline:
          'Abducted, infected, lost. You are turning into a monster, but as the corruption inside you grows, so does your power.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc8d7z.webp',
        genres: ['Role-playing (RPG)', 'Strategy', 'Tactical', 'Turn-based strategy (TBS)'],
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S', 'Mac'],
        releaseYear: '2023',
        developer: 'Larian Studios',
        publisher: 'Larian Studios',
        rating: 4.9
      },
      {
        id: 1877,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        summary:
          'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8v0m.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7t6y.webp',
        genres: ['Role-playing (RPG)', 'Shooter', 'Adventure'],
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2020',
        developer: 'CD Projekt RED',
        publisher: 'CD Projekt',
        rating: 4.4
      },
      {
        id: 119277,
        name: 'The Legend of Zelda: Tears of the Kingdom',
        slug: 'the-legend-of-zelda-tears-of-the-kingdom',
        summary:
          'An epic adventure across the land and skies of Hyrule awaits in The Legend of Zelda: Tears of the Kingdom for Nintendo Switch.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc8x8s.webp',
        genres: ['Adventure'],
        platforms: ['Nintendo Switch'],
        releaseYear: '2023',
        developer: 'Nintendo EPD',
        publisher: 'Nintendo',
        rating: 4.8
      }
    ];
  }
}

export const igdbProvider = new IgdbProvider();
