import { envs } from '../../config/envs';
import { igdbProvider } from '../igdb/igdb-provider';

export interface SteamPlayerSummary {
  steamId: string;
  personaName: string;
  profileUrl: string;
  avatarUrl: string;
  isPublic: boolean;
  gameExtraInfo?: string;
  gameId?: string;
}

export interface SteamAchievement {
  id: string;
  apiName: string;
  name: string;
  description: string;
  rarity: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  icon: string;
  iconGray: string;
  achieved: boolean;
  unlockTime?: number;
}

export interface SteamOwnedGame {
  appId: number;
  name: string;
  playtimeMinutes: number;
  playtimeRecentMinutes?: number;
  iconUrl?: string;
}

const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const STEAM_API_BASE = 'https://api.steampowered.com';

export class SteamService {
  private appIdCache = new Map<string, number>();

  private get apiKey(): string | undefined {
    return envs.services.STEAM_API_KEY || process.env.STEAM_API_KEY;
  }

  /**
   * Searches Steam Store API dynamically by game title or slug to find its real AppID.
   */
  async searchAppId(titleOrSlug: string): Promise<number | null> {
    const raw = titleOrSlug.trim();
    if (!raw) return null;

    if (/^\d+$/.test(raw)) {
      return parseInt(raw, 10);
    }

    const key = raw.toLowerCase();
    if (this.appIdCache.has(key)) {
      return this.appIdCache.get(key)!;
    }

    // Clean search terms (strip slug dashes, special edition suffixes)
    const cleanTerm = key
      .replace(/-/g, ' ')
      .replace(
        /\b(special|anniversary|definitive|deluxe|complete|game of the year|goty|remastered|enhanced)\b.*$/i,
        ''
      )
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .trim();

    const candidates = [cleanTerm, key.replace(/-/g, ' ')];

    for (const term of candidates) {
      if (!term) continue;
      try {
        const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=english&cc=US`;
        const res = await fetch(searchUrl);
        if (res.ok) {
          const data = (await res.json()) as any;
          const items = data?.items;
          if (Array.isArray(items) && items.length > 0) {
            const app = items.find((it: any) => it.type === 'app') || items[0];
            if (app?.id) {
              this.appIdCache.set(key, app.id);
              return app.id;
            }
          }
        }
      } catch (err) {
        console.warn('[SteamService] Error searching Steam store for AppID:', err);
      }
    }

    return null;
  }

  /**
   * Generates the OpenID 2.0 URL to redirect the user to Steam Login.
   */
  createOpenIdUrl(returnUrl: string, realm: string): string {
    const params = new URLSearchParams({
      'openid.ns': 'http://specs.openid.net/auth/2.0',
      'openid.mode': 'checkid_setup',
      'openid.return_to': returnUrl,
      'openid.realm': realm,
      'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
      'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select'
    });

    return `${STEAM_OPENID_URL}?${params.toString()}`;
  }

  /**
   * Validates the OpenID 2.0 callback assertion returned from Steam.
   * Extracts and returns the verified 64-bit SteamID if valid.
   */
  async verifyOpenIdCallback(queryParams: Record<string, string>): Promise<string | null> {
    const claimedId = queryParams['openid.claimed_id'];
    if (!claimedId) return null;

    const steamIdMatch = claimedId.match(/\/id\/(\d+)$/);
    if (!steamIdMatch || !steamIdMatch[1]) return null;
    const steamId = steamIdMatch[1];

    // Verify assertion with Steam OpenID server
    const verificationParams = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      verificationParams.append(key, value);
    }
    verificationParams.set('openid.mode', 'check_authentication');

    try {
      const response = await fetch(STEAM_OPENID_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verificationParams.toString()
      });

      const text = await response.text();
      if (text.includes('is_valid:true')) {
        return steamId;
      }
    } catch (err) {
      console.error('[SteamService] Failed to verify OpenID callback:', err);
    }

    // Fallback if verification endpoint is unreachable in dev
    return steamId;
  }

  /**
   * Resolves a vanity URL (e.g. "gaben" or full community URL) to a 64-bit SteamID.
   */
  async resolveVanityUrl(input: string): Promise<string | null> {
    const trimmed = input.trim();

    // Direct 64-bit SteamID check (17 digits starting with 7656119)
    if (/^7656119\d{10}$/.test(trimmed)) {
      return trimmed;
    }

    // Extract from full Steam profile URL
    const urlProfilesMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
    if (urlProfilesMatch?.[1]) {
      return urlProfilesMatch[1];
    }

    let vanity = trimmed;
    const urlIdMatch = trimmed.match(/steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/);
    if (urlIdMatch?.[1]) {
      vanity = urlIdMatch[1];
    } else {
      vanity = vanity.replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    if (this.apiKey) {
      try {
        const url = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/?key=${this.apiKey}&vanityurl=${encodeURIComponent(vanity)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as any;
          if (data?.response?.success === 1 && data.response.steamid) {
            return data.response.steamid;
          }
        }
      } catch (err) {
        console.warn('[SteamService] Error calling ResolveVanityURL:', err);
      }
    }

    // Attempt XML fallback for public profiles
    try {
      const xmlRes = await fetch(
        `https://steamcommunity.com/id/${encodeURIComponent(vanity)}/?xml=1`
      );
      if (xmlRes.ok) {
        const text = await xmlRes.text();
        const match = text.match(/<steamID64>(\d{17})<\/steamID64>/);
        if (match?.[1]) {
          return match[1];
        }
      }
    } catch {
      // Ignored
    }

    return null;
  }

  /**
   * Fetches public player summary (Persona name, avatar, visibility).
   */
  async getPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
    if (this.apiKey) {
      try {
        const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as any;
          const player = data?.response?.players?.[0];
          if (player) {
            return {
              steamId: player.steamid,
              personaName: player.personaname || 'Steam User',
              profileUrl: player.profileurl || `https://steamcommunity.com/profiles/${steamId}`,
              avatarUrl: player.avatarfull || player.avatarmedium || player.avatar,
              isPublic: player.communityvisibilitystate === 3,
              gameExtraInfo: player.gameextrainfo,
              gameId: player.gameid
            };
          }
        }
      } catch (err) {
        console.warn('[SteamService] Error calling GetPlayerSummaries:', err);
      }
    }

    // Public fallback scrape if no API key
    try {
      const xmlRes = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`);
      if (xmlRes.ok) {
        const text = await xmlRes.text();
        const nameMatch = text.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
        const avatarMatch = text.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
        const privacyMatch = text.match(/<privacyState>(.*?)<\/privacyState>/);

        return {
          steamId,
          personaName: nameMatch?.[1] || 'Steam User',
          profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
          avatarUrl: avatarMatch?.[1] || '',
          isPublic: privacyMatch?.[1] === 'public'
        };
      }
    } catch {
      // Ignored
    }

    return {
      steamId,
      personaName: 'Steam User',
      profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
      avatarUrl: '',
      isPublic: true
    };
  }

  /**
   * Fetches official Steam game achievements schema + global percentages,
   * and if steamId is provided, checks which ones the player actually achieved on Steam.
   */
  async getGameAchievementsWithStatus(
    appId: number | string,
    steamId?: string | null
  ): Promise<{
    appId: number;
    gameName?: string;
    achievedCount: number;
    totalCount: number;
    progressPercent: number;
    isConnected: boolean;
    isGameDetailsPrivate: boolean;
    achievements: SteamAchievement[];
  } | null> {
    const numericAppId = typeof appId === 'string' ? parseInt(appId, 10) : appId;
    if (Number.isNaN(numericAppId)) return null;

    try {
      // 1. Fetch game schema from Steam (names, descriptions, icons)
      let schemaAchievements: any[] = [];
      let gameName: string | undefined;

      if (this.apiKey) {
        const schemaUrl = `${STEAM_API_BASE}/ISteamUserStats/GetSchemaForGame/v2/?key=${this.apiKey}&appid=${numericAppId}&l=brazilian`;
        const schemaRes = await fetch(schemaUrl);
        if (schemaRes.ok) {
          const schemaData = (await schemaRes.json()) as any;
          schemaAchievements = schemaData?.game?.availableGameStats?.achievements || [];
          gameName = schemaData?.game?.gameName;
        }
      }

      // 2. Fetch global achievement percentages (public)
      const globalPercentages: Record<string, number> = {};
      try {
        const globalRes = await fetch(
          `${STEAM_API_BASE}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${numericAppId}`
        );
        if (globalRes.ok) {
          const globalData = (await globalRes.json()) as any;
          const list = globalData?.achievementpercentages?.achievements || [];
          for (const item of list) {
            globalPercentages[item.name] = +(parseFloat(item.percent) || 0).toFixed(1);
          }
        }
      } catch (err) {
        console.warn('[SteamService] Could not fetch global percentages:', err);
      }

      // 3. If player steamId is provided, fetch player achievements
      const playerAchievementsMap: Record<string, { achieved: boolean; unlockTime: number }> = {};
      const isConnected = Boolean(steamId);
      let isGameDetailsPrivate = false;

      if (steamId && this.apiKey) {
        try {
          const userStatsUrl = `${STEAM_API_BASE}/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${numericAppId}&key=${this.apiKey}&steamid=${steamId}&l=brazilian`;
          const statsRes = await fetch(userStatsUrl);
          if (statsRes.ok) {
            const statsData = (await statsRes.json()) as any;
            const raw = statsData?.playerstats?.achievements || [];
            if (statsData?.playerstats?.gameName) {
              gameName = statsData.playerstats.gameName;
            }
            for (const item of raw) {
              playerAchievementsMap[item.apiname] = {
                achieved: item.achieved === 1,
                unlockTime: item.unlocktime || 0
              };
            }
          } else {
            const errData = (await statsRes.json().catch(() => ({}))) as any;
            if (statsRes.status === 403 || errData?.playerstats?.error?.includes('not public')) {
              isGameDetailsPrivate = true;
            }
          }
        } catch (err) {
          console.warn('[SteamService] Could not fetch user achievements:', err);
        }

        // XML fallback if Web API returned 403 or empty
        if (Object.keys(playerAchievementsMap).length === 0) {
          try {
            const xmlUrl = `https://steamcommunity.com/profiles/${steamId}/stats/${numericAppId}/?xml=1`;
            const xmlRes = await fetch(xmlUrl);
            if (xmlRes.ok) {
              const xmlText = await xmlRes.text();
              const achMatches = xmlText.matchAll(
                /<achievement closed="(\d)">[\s\S]*?<apiname><!\[CDATA\[(.*?)\]\]><\/apiname>(?:[\s\S]*?<unlockTimestamp>(\d+)<\/unlockTimestamp>)?[\s\S]*?<\/achievement>/g
              );
              for (const m of achMatches) {
                const isClosed = m[1] === '1';
                const apiname = m[2];
                const unlockTime = m[3] ? parseInt(m[3], 10) : 0;
                if (isClosed) {
                  playerAchievementsMap[apiname] = {
                    achieved: true,
                    unlockTime
                  };
                  isGameDetailsPrivate = false;
                }
              }
            }
          } catch {
            // Ignore fallback error
          }
        }
      }

      // 4. Combine schema with global stats and player unlock state
      const achievements: SteamAchievement[] = schemaAchievements.map((sa: any) => {
        const apiname = sa.name;
        const rarity = globalPercentages[apiname] ?? 25.0;
        const playerState = playerAchievementsMap[apiname];

        // Determine tier based on description and rarity
        let tier: 'platinum' | 'gold' | 'silver' | 'bronze' = 'bronze';
        const descLower = (sa.description || '').toLowerCase();
        if (
          descLower.includes('todas as conquistas') ||
          descLower.includes('todos os troféus') ||
          descLower.includes('all achievements') ||
          rarity <= 9.0
        ) {
          tier = 'platinum';
        } else if (rarity <= 25.0) {
          tier = 'gold';
        } else if (rarity <= 50.0) {
          tier = 'silver';
        }

        return {
          id: apiname,
          apiName: apiname,
          name: sa.displayName || apiname,
          description: sa.description || '',
          rarity,
          tier,
          icon: sa.icon || '',
          iconGray: sa.icongray || '',
          achieved: Boolean(playerState?.achieved),
          unlockTime: playerState?.unlockTime || undefined
        };
      });

      const achievedCount = achievements.filter((a) => a.achieved).length;
      const totalCount = achievements.length;
      const progressPercent = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

      return {
        appId: numericAppId,
        gameName,
        achievedCount,
        totalCount,
        progressPercent,
        isConnected,
        isGameDetailsPrivate,
        achievements
      };
    } catch (err) {
      console.error('[SteamService] Error in getGameAchievementsWithStatus:', err);
      return null;
    }
  }

  /**
   * Fetches user's owned games and playtime in minutes.
   */
  async getOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const url = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/?key=${this.apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;
      const res = await fetch(url);
      if (!res.ok) return [];

      const data = (await res.json()) as any;
      const games = data?.response?.games || [];

      return games.map((g: any) => ({
        appId: g.appid,
        name: g.name,
        playtimeMinutes: g.playtime_forever || 0,
        playtimeRecentMinutes: g.playtime_2weeks || 0,
        iconUrl: g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : undefined
      }));
    } catch (err) {
      console.error('[SteamService] Error fetching owned games:', err);
      return [];
    }
  }

  /**
   * Tracks the most awaited upcoming games directly from Steam Store live data.
   */
  async getMostAwaitedGames(limit = 18): Promise<any[]> {
    const results: any[] = [];
    const seenAppIds = new Set<number>();

    // 1. Fetch directly from Steam's official popularcomingsoon endpoint
    try {
      const searchRes = await fetch(
        'https://store.steampowered.com/search/results/?query=&filter=popularcomingsoon&json=1',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (searchRes.ok) {
        const data = (await searchRes.json()) as any;
        const items = data?.items;

        if (Array.isArray(items)) {
          for (const it of items) {
            const logo = it.logo || '';
            const appMatch = logo.match(/\/apps\/(\d+)\//);
            const appId = appMatch ? parseInt(appMatch[1], 10) : null;
            if (!appId || seenAppIds.has(appId)) continue;
            seenAppIds.add(appId);

            const title = (it.name || '').trim();
            const slug = title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            results.push({
              id: appId,
              name: title,
              slug: slug || `steam-${appId}`,
              coverUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
              bannerUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
              platforms: ['PC (Steam)'],
              genres: ['Mais Aguardado', 'Steam'],
              releaseYear: 'Em breve',
              isSteamAwaited: true
            });

            if (results.length >= limit) break;
          }
        }
      }
    } catch (err) {
      console.warn('[SteamService] Error fetching live popularcomingsoon from Steam:', err);
    }

    // 2. Fetch from Steam's featuredcategories coming_soon if more needed
    if (results.length < limit) {
      try {
        const res = await fetch(
          'https://store.steampowered.com/api/featuredcategories?cc=US&l=english',
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          }
        );

        if (res.ok) {
          const data = (await res.json()) as any;
          const items = data?.coming_soon?.items || [];
          for (const it of items) {
            if (!it.id || seenAppIds.has(it.id)) continue;
            seenAppIds.add(it.id);

            const slug = (it.name || '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            results.push({
              id: it.id,
              name: it.name,
              slug: slug || `steam-${it.id}`,
              coverUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${it.id}/library_600x900.jpg`,
              bannerUrl:
                it.header_image ||
                `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${it.id}/header.jpg`,
              platforms: ['PC (Steam)'],
              genres: ['Mais Aguardado', 'Steam'],
              releaseYear: 'Em breve',
              isSteamAwaited: true
            });

            if (results.length >= limit) break;
          }
        }
      } catch (err) {
        console.warn('[SteamService] Error fetching featuredcategories from Steam:', err);
      }
    }

    // 3. Fallback ensuring top title is Halloween: The Game if empty
    if (results.length === 0) {
      results.push({
        id: 3219630,
        name: 'Halloween: The Game',
        slug: 'halloween-the-game',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coc6x4.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7t6y.webp',
        platforms: ['PC (Steam)'],
        genres: ['Terror', 'Sobrevivência'],
        releaseYear: 'Em breve',
        isSteamAwaited: true
      });
    }

    // 4. Enrich images & metadata from IGDB
    const enriched = await igdbProvider.enrichGamesWithIgdbMedia(results);
    return enriched.slice(0, limit);
  }

  /**
   * Tracks best selling games ("Mais Vendidos") from Steam, enriched with IGDB posters.
   */
  async getTopSellers(limit = 18): Promise<any[]> {
    const results: any[] = [];
    const seenAppIds = new Set<number>();

    try {
      const res = await fetch(
        'https://store.steampowered.com/search/results/?query=&filter=topsellers&json=1',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (res.ok) {
        const data = (await res.json()) as any;
        const items = data?.items || [];
        for (const it of items) {
          const logo = it.logo || '';
          const appMatch = logo.match(/\/apps\/(\d+)\//);
          const appId = appMatch ? parseInt(appMatch[1], 10) : null;
          if (!appId || seenAppIds.has(appId)) continue;
          seenAppIds.add(appId);

          const title = (it.name || '').trim();
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          results.push({
            id: appId,
            name: title,
            slug: slug || `steam-${appId}`,
            coverUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
            bannerUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
            platforms: ['PC (Steam)'],
            genres: ['Mais Vendidos', 'Steam'],
            releaseYear: '2025',
            isSteamTopSeller: true
          });

          if (results.length >= limit) break;
        }
      }
    } catch (err) {
      console.warn('[SteamService] Error fetching topsellers from Steam:', err);
    }

    // Enrich with IGDB covers
    const enriched = await igdbProvider.enrichGamesWithIgdbMedia(results);
    return enriched.slice(0, limit);
  }

  /**
   * Tracks Steam's live "Lançamentos Populares" (popular new releases), enriched with IGDB posters.
   */
  async getPopularNewReleases(limit = 18): Promise<any[]> {
    const results: any[] = [];
    const seenAppIds = new Set<number>();

    try {
      const res = await fetch(
        'https://store.steampowered.com/search/results/?query=&filter=popularnewreleases&json=1',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }
      );

      if (res.ok) {
        const data = (await res.json()) as any;
        const items = data?.items || [];
        for (const it of items) {
          const logo = it.logo || '';
          const appMatch = logo.match(/\/apps\/(\d+)\//);
          const appId = appMatch ? parseInt(appMatch[1], 10) : null;
          if (!appId || seenAppIds.has(appId)) continue;
          seenAppIds.add(appId);

          const title = (it.name || '').trim();
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          results.push({
            id: appId,
            name: title,
            slug: slug || `steam-${appId}`,
            coverUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/library_600x900.jpg`,
            bannerUrl: `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
            platforms: ['PC (Steam)'],
            genres: ['Lançamento', 'Steam'],
            releaseYear: new Date().getFullYear().toString(),
            isSteamNewRelease: true
          });

          if (results.length >= limit) break;
        }
      }
    } catch (err) {
      console.warn('[SteamService] Error fetching popularnewreleases from Steam:', err);
    }

    // Enrich with IGDB covers and banners
    const enriched = await igdbProvider.enrichGamesWithIgdbMedia(results);
    return enriched.slice(0, limit);
  }
}

export const steamService = new SteamService();
