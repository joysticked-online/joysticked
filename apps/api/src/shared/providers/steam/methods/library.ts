import { SteamAchievementMethods } from './achievements';
import type { SteamOwnedGame } from './core';
import { STEAM_API_BASE } from './core';

export class SteamLibraryMethods extends SteamAchievementMethods {
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
}
