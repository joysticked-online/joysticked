import type { SteamPlayerSummary } from './core';
import { STEAM_API_BASE } from './core';
import { SteamOpenIdMethods } from './openid';

export class SteamProfileMethods extends SteamOpenIdMethods {
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
}
