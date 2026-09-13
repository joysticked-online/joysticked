import type { IgdbTimeToBeat } from '../types';
import { IgdbSearchMethods } from './search';

type IgdbTimeToBeatResponse = {
  game_id: number;
  completely?: number;
  hastily?: number;
  normally?: number;
};

export class IgdbTimeToBeatMethods extends IgdbSearchMethods {
  /** Fetches playtime estimates using IGDB's game_time_to_beats endpoint. */
  async getTimeToBeat(gameId: number): Promise<IgdbTimeToBeat | null> {
    if (!Number.isInteger(gameId) || gameId <= 0) return null;
    const cacheKey = String(gameId);
    const cached = this.timeToBeatCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < IgdbTimeToBeatMethods.LIST_CACHE_TTL) {
      return cached.data;
    }

    const token = await this.getAccessToken();
    if (!token || !this.clientId) return null;

    try {
      const res = await fetch('https://api.igdb.com/v4/game_time_to_beats', {
        method: 'POST',
        headers: {
          'Client-ID': this.clientId,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/plain'
        },
        body: `fields game_id, completely, hastily, normally; where game_id = ${gameId}; limit 1;`
      });
      if (!res.ok) return null;

      const [result] = (await res.json()) as IgdbTimeToBeatResponse[];
      const data = result
        ? {
            gameId: result.game_id,
            completely: result.completely,
            hastily: result.hastily,
            normally: result.normally
          }
        : null;
      this.timeToBeatCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    }
  }
}
