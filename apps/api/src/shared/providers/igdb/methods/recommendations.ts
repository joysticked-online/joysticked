import type { IgdbGame, IgdbRawGame } from './core';
import { IgdbSearchMethods } from './search';

export class IgdbRecommendationMethods extends IgdbSearchMethods {
  async getGameBySlugOrId(identifier: string): Promise<IgdbGame | null> {
    const normalizedIdentifier = identifier.toLowerCase().trim();
    const isNumeric = /^\d+$/.test(normalizedIdentifier);
    if (!isNumeric && !/^[a-z0-9][a-z0-9-]{0,127}$/.test(normalizedIdentifier)) {
      return null;
    }

    const cacheKey = normalizedIdentifier;
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
      const whereClause = isNumeric
        ? `where id = ${normalizedIdentifier};`
        : `where slug = "${normalizedIdentifier}";`;

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
}
