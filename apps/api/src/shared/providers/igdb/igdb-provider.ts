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
  firstReleaseDate?: string;
  releaseYear?: string;
  developer?: string;
  publisher?: string;
  rating?: number;
  aggregatedRating?: number;
};

type IgdbRawGame = {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  cover?: { id: number; image_id?: string; url?: string };
  artworks?: { id: number; image_id?: string; url?: string }[];
  screenshots?: { id: number; image_id?: string; url?: string }[];
  genres?: { id: number; name: string }[];
  platforms?: { id: number; name: string; abbreviation?: string }[];
  first_release_date?: number;
  rating?: number;
  aggregated_rating?: number;
  involved_companies?: {
    id: number;
    developer: boolean;
    publisher: boolean;
    company?: { id: number; name: string };
  }[];
};

class IgdbProvider {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = envs.services.TWITCH_CLIENT_ID;
    this.clientSecret = envs.services.TWITCH_CLIENT_SECRET;
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

  private formatImageUrl(imageId?: string, size: 't_cover_big' | 't_1080p' | 't_720p' | 't_screenshot_huge' = 't_cover_big'): string | undefined {
    if (!imageId) return undefined;
    return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.webp`;
  }

  private transformGame(raw: IgdbRawGame): IgdbGame {
    const coverUrl = raw.cover?.image_id
      ? this.formatImageUrl(raw.cover.image_id, 't_cover_big')
      : raw.cover?.url?.replace('t_thumb', 't_cover_big')?.replace(/^\/\//, 'https://');

    const slug = raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const adminBanner = ADMIN_GAME_BANNERS[slug] || ADMIN_GAME_BANNERS[String(raw.id)];

    // Pick admin banner, top artwork, or screenshot for 1080p banner
    const topArtwork = raw.artworks?.[0]?.image_id || raw.screenshots?.[0]?.image_id;
    const bannerUrl = adminBanner || (topArtwork
      ? this.formatImageUrl(topArtwork, 't_1080p')
      : coverUrl);

    const artworks = raw.artworks
      ?.map((a) => this.formatImageUrl(a.image_id, 't_1080p'))
      .filter(Boolean) as string[] || [];

    const screenshots = raw.screenshots
      ?.map((s) => this.formatImageUrl(s.image_id, 't_1080p'))
      .filter(Boolean) as string[] || [];

    const genres = raw.genres?.map((g) => g.name) || [];
    const platforms = raw.platforms?.map((p) => p.name) || [];

    let releaseYear: string | undefined;
    let firstReleaseDate: string | undefined;
    if (raw.first_release_date) {
      const d = new Date(raw.first_release_date * 1000);
      releaseYear = d.getFullYear().toString();
      firstReleaseDate = d.toISOString();
    }

    const developer = raw.involved_companies?.find((c) => c.developer)?.company?.name;
    const publisher = raw.involved_companies?.find((c) => c.publisher)?.company?.name;

    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: raw.summary,
      storyline: raw.storyline,
      coverUrl,
      bannerUrl,
      artworks,
      screenshots,
      genres,
      platforms,
      firstReleaseDate,
      releaseYear,
      developer,
      publisher,
      rating: raw.rating ? Math.round(raw.rating) / 20 : undefined, // Convert 0-100 to 0-5
      aggregatedRating: raw.aggregated_rating ? Math.round(raw.aggregated_rating) / 20 : undefined
    };
  }

  async searchGames(query: string, limit = 20): Promise<IgdbGame[]> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      console.warn('IGDB credentials missing. Returning fallback sample catalog.');
      return this.getFallbackGames().filter((g) =>
        g.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    try {
      const sanitized = query.replace(/"/g, '\\"');
      const body = `
        fields name, slug, summary, storyline, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation,
               first_release_date, rating, aggregated_rating,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        search "${sanitized}";
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

      if (!res.ok) {
        console.error('IGDB API error:', await res.text());
        return [];
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      return rawGames.map((g) => this.transformGame(g));
    } catch (err) {
      console.error('Error querying IGDB API:', err);
      return [];
    }
  }

  async getGameBySlugOrId(identifier: string): Promise<IgdbGame | null> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return (
        this.getFallbackGames().find(
          (g) => g.slug === identifier || String(g.id) === identifier
        ) || null
      );
    }

    try {
      const isNumeric = /^\d+$/.test(identifier);
      const whereClause = isNumeric
        ? `where id = ${identifier};`
        : `where slug = "${identifier}";`;

      const body = `
        fields name, slug, summary, storyline, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation,
               first_release_date, rating, aggregated_rating,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
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
        console.error('IGDB API error:', await res.text());
        return null;
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      if (!rawGames || rawGames.length === 0) {
        return null;
      }

      return this.transformGame(rawGames[0]);
    } catch (err) {
      console.error('Error fetching game by slug/id from IGDB:', err);
      return null;
    }
  }

  async getPopularGames(limit = 12): Promise<IgdbGame[]> {
    const token = await this.getAccessToken();
    if (!token || !this.clientId) {
      return this.getFallbackGames().slice(0, limit);
    }

    try {
      const body = `
        fields name, slug, summary, storyline, cover.image_id, cover.url,
               artworks.image_id, artworks.url, screenshots.image_id, screenshots.url,
               genres.name, platforms.name, platforms.abbreviation,
               first_release_date, rating, aggregated_rating,
               involved_companies.developer, involved_companies.publisher, involved_companies.company.name;
        where rating_count > 50 & cover != null;
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

      if (!res.ok) {
        console.error('IGDB API popular error:', await res.text());
        return this.getFallbackGames().slice(0, limit);
      }

      const rawGames = (await res.json()) as IgdbRawGame[];
      return rawGames.map((g) => this.transformGame(g));
    } catch (err) {
      console.error('Error fetching popular games from IGDB:', err);
      return this.getFallbackGames().slice(0, limit);
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
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S', 'PlayStation 4', 'Xbox One'],
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
          'An ancient evil has returned to Baldur\'s Gate, intent on devouring it from the inside out. The fate of the Forgotten Realms lies in your hands.',
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
