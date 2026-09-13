import type { IgdbGame } from './core';
import { IgdbCoreMethods } from './core';

export class IgdbFallbackMethods extends IgdbCoreMethods {
  protected getFallbackGames(): IgdbGame[] {
    return [
      {
        id: 119133,
        name: 'Elden Ring',
        slug: 'elden-ring',
        summary:
          'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
        storyline:
          'In the Lands Between ruled by Queen Marika the Eternal, the Elden Ring, the source of the Erdtree, has been shattered.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.webp',
        genres: ['Role-playing (RPG)', 'Adventure'],
        platforms: [
          'PC (Microsoft Windows)',
          'PlayStation 5',
          'Xbox Series X|S',
          'PlayStation 4',
          'Xbox One'
        ],
        releaseYear: '2022',
        developer: 'FromSoftware',
        publisher: 'Bandai Namco Entertainment',
        rating: 4.9
      },
      {
        id: 125174,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        summary:
          "An ancient evil has returned to Baldur's Gate, intent on devouring it from the inside out. The fate of the Forgotten Realms lies in your hands.",
        storyline:
          'Abducted, infected, lost. You are turning into a monster, but as the corruption inside you grows, so does your power.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc8d7z.webp',
        genres: ['Role-playing (RPG)', 'Strategy', 'Tactical', 'Turn-based strategy (TBS)'],
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S', 'Mac'],
        releaseYear: '2023',
        developer: 'Larian Studios',
        publisher: 'Larian Studios',
        rating: 4.9
      },
      {
        id: 1877,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        summary:
          'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyberpunk mercenary wrapped up in a do-or-die fight for survival.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8v0m.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7t6y.webp',
        genres: ['Role-playing (RPG)', 'Shooter', 'Adventure'],
        platforms: ['PC (Microsoft Windows)', 'PlayStation 5', 'Xbox Series X|S'],
        releaseYear: '2020',
        developer: 'CD Projekt RED',
        publisher: 'CD Projekt',
        rating: 4.4
      },
      {
        id: 119277,
        name: 'The Legend of Zelda: Tears of the Kingdom',
        slug: 'the-legend-of-zelda-tears-of-the-kingdom',
        summary:
          'An epic adventure across the land and skies of Hyrule awaits in The Legend of Zelda: Tears of the Kingdom for Nintendo Switch.',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
        bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc8x8s.webp',
        genres: ['Adventure'],
        platforms: ['Nintendo Switch'],
        releaseYear: '2023',
        developer: 'Nintendo EPD',
        publisher: 'Nintendo',
        rating: 4.8
      }
    ];
  }
}
