import { SteamCatalogMethods } from './methods/catalog';

export class SteamService extends SteamCatalogMethods {}

export type { SteamAchievement, SteamOwnedGame, SteamPlayerSummary } from './methods/core';

export const steamService = new SteamService();
