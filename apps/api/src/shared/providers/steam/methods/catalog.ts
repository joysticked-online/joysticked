import { igdbProvider } from '../../igdb/igdb-provider';
import { SteamLibraryMethods } from './library';

export class SteamCatalogMethods extends SteamLibraryMethods {
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
