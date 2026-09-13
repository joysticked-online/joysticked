import type { SteamAchievement } from './core';
import { STEAM_API_BASE } from './core';
import { SteamProfileMethods } from './profiles';

export class SteamAchievementMethods extends SteamProfileMethods {
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
}
