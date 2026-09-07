export type Profile = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  socials: {
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
    steam?: string | null;
    steamId?: string | null;
    steamPublic?: boolean | null;
    instagram?: string | null;
  } | null;
  preferences?: {
    platforms?: string[];
    genres?: string[];
    likedGames?: string[];
  } | null;
  createdAt: string;
};

export type Tab = 'activity' | 'collection' | 'lists' | 'reviews' | 'stats';
export type CollectionFilter = 'all' | 'playing' | 'completed' | 'backlog';

export type ProfileGame = {
  id: string;
  title: string;
  coverUrl: string;
  backdropUrl?: string;
  year: string;
  developer: string;
  status: string;
  rating?: number;
  hours?: string;
  reviewSnippet?: string;
  genres: string[];
  platformTag?: string;
  completedDate?: string;
};

export const PLATFORM_CONFIG: Record<
  string,
  { name: string; tag: string; color: string; dotColor: string }
> = {
  pc: {
    name: 'PC / Steam',
    tag: 'Steam',
    color: 'bg-sky-500/10 text-sky-400',
    dotColor: 'bg-sky-400'
  },
  playstation: {
    name: 'PlayStation 5',
    tag: 'PS5',
    color: 'bg-indigo-500/10 text-indigo-400',
    dotColor: 'bg-indigo-400'
  },
  xbox: {
    name: 'Xbox Series X|S',
    tag: 'Xbox',
    color: 'bg-emerald-500/10 text-emerald-400',
    dotColor: 'bg-emerald-400'
  },
  switch: {
    name: 'Nintendo Switch',
    tag: 'Switch',
    color: 'bg-rose-500/10 text-rose-400',
    dotColor: 'bg-rose-400'
  },
  handheld: {
    name: 'Steam Deck & Retro',
    tag: 'Handheld',
    color: 'bg-purple-500/10 text-purple-400',
    dotColor: 'bg-purple-400'
  }
};

export const GAME_CATALOG_LOOKUP: Record<string, ProfileGame> = {
  'elden-ring': {
    id: 'elden-ring',
    title: 'Elden Ring',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.webp',
    year: '2022',
    developer: 'FromSoftware',
    status: 'Concluído • 100%',
    rating: 5,
    hours: '142h',
    reviewSnippet:
      'Uma obra-prima incontestável de exploração e combate. The Lands Between é inesquecível do início ao fim.',
    genres: ['Action RPG', 'Souls-like'],
    platformTag: 'PC / Steam',
    completedDate: 'há 2 dias'
  },
  'baldurs-gate-3': {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc8d7z.webp',
    year: '2023',
    developer: 'Larian Studios',
    status: 'Jogando Atualmente',
    rating: 5,
    hours: '85h',
    reviewSnippet:
      'A profundidade narrativa e a liberdade tática são inacreditáveis. Ato 3 é puro cinema.',
    genres: ['RPG', 'Turn-Based'],
    platformTag: 'PC / Steam',
    completedDate: 'há 5 dias'
  },
  'cyberpunk-2077': {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8v0m.webp',
    backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7t6y.webp',
    year: '2020',
    developer: 'CD Projekt RED',
    status: 'Concluído',
    rating: 4.5,
    hours: '96h',
    reviewSnippet:
      'Night City é hipnotizante. Phantom Liberty elevou o jogo para o patamar dos maiores RPGs modernos.',
    genres: ['Action RPG', 'Open World'],
    platformTag: 'PS5',
    completedDate: 'há 2 semanas'
  },
  'zelda-totk': {
    id: 'zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
    backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc8x8s.webp',
    year: '2023',
    developer: 'Nintendo',
    status: 'Na Fila',
    rating: 5,
    hours: '60h',
    reviewSnippet:
      'Engenharia de física e criatividade que redefine o que um jogo de aventura pode proporcionar.',
    genres: ['Action-Adventure', 'Open World'],
    platformTag: 'Switch',
    completedDate: 'Planejado'
  },
  'god-of-war-ragnarok': {
    id: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp',
    backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7w7z.webp',
    year: '2022',
    developer: 'Santa Monica Studio',
    status: 'Concluído',
    rating: 4.8,
    hours: '48h',
    reviewSnippet:
      'Combate visceral com um encerramento emocionante para a saga nórdica de Kratos e Atreus.',
    genres: ['Action-Adventure', 'Mythology'],
    platformTag: 'PS5',
    completedDate: 'há 1 mês'
  },
  'hollow-knight': {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co952f.webp',
    backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc6w2k.webp',
    year: '2017',
    developer: 'Team Cherry',
    status: 'Platinado',
    rating: 5,
    hours: '62h',
    reviewSnippet:
      'O ápice do gênero Metroidvania. Atmosfera melancólica, trilha sonora e combate impecáveis.',
    genres: ['Metroidvania', 'Indie'],
    platformTag: 'Steam Deck',
    completedDate: 'há 3 meses'
  }
};
