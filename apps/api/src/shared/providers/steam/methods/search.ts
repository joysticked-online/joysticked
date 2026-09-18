import { SteamCoreMethods } from './core';

export class SteamSearchMethods extends SteamCoreMethods {
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
}
