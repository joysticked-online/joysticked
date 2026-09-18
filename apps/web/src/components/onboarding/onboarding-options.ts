export type PlatformOption = {
  id: string;
  name: string;
  badge: string;
  description: string;
  iconTag: string;
};

export const PLATFORMS: PlatformOption[] = [
  {
    id: 'pc',
    name: 'PC / Steam',
    badge: 'Steam',
    description: 'Steam, Epic Games, GOG',
    iconTag: 'PC'
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    badge: 'PS5 / PS4',
    description: 'PlayStation 5 & PlayStation 4',
    iconTag: 'PS'
  },
  {
    id: 'xbox',
    name: 'Xbox',
    badge: 'Series / One',
    description: 'Xbox Series X|S & Game Pass',
    iconTag: 'XB'
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    badge: 'Switch',
    description: 'Switch, OLED & Retro Nintendo',
    iconTag: 'NSW'
  },
  {
    id: 'handheld',
    name: 'Portáteis & Emuladores',
    badge: 'Deck / Retro',
    description: 'Steam Deck, ROG Ally, Portáteis',
    iconTag: 'HD'
  }
];

export const GENRES = [
  'RPG',
  'Ação',
  'Souls-like',
  'FPS',
  'Indie',
  'Terror',
  'Roguelike',
  'Mundo Aberto',
  'Estratégia',
  'Plataforma',
  'Metroidvania',
  'Narrativo'
];

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.16 }
  },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

export const itemVariants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 12 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, duration: 0.24, bounce: 0 }
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -10,
    transition: { duration: 0.1 }
  })
};
