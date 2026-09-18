import { envs } from '../../../config/envs';

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

export const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
export const STEAM_API_BASE = 'https://api.steampowered.com';

export class SteamCoreMethods {
  protected appIdCache = new Map<string, number>();

  protected get apiKey(): string | undefined {
    return envs.services.STEAM_API_KEY || process.env.STEAM_API_KEY;
  }
}
