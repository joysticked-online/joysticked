import type { Game } from './games';

export interface UserList {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ownerUsername: string;
  ownerDisplayName?: string | null;
  ownerAvatarUrl?: string | null;
  isPublic: boolean;
  coverGameSlug?: string;
  coverUrl?: string | null;
  games: Game[];
  gameCount: number;
  likesCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Official curated lists by @joysticked
export const DEFAULT_COMMUNITY_LISTS: UserList[] = [
  {
    id: 'list_curated_1',
    slug: 'favoritos-de-sempre',
    name: 'Favoritos de Sempre',
    description: 'Os títulos mais marcantes, aclamados e influentes da história dos videogames.',
    ownerUsername: 'joysticked',
    ownerDisplayName: 'Joysticked',
    ownerAvatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=joysticked',
    isPublic: true,
    likesCount: 342,
    tags: ['Obrigatórios', 'Aclamados', 'Clássicos'],
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-05-18T14:30:00Z',
    gameCount: 6,
    games: [
      {
        id: 119133,
        name: 'Elden Ring',
        slug: 'elden-ring',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        rating: 4.8,
        releaseYear: '2022',
        genres: ['RPG', 'Ação', 'Souls-like']
      },
      {
        id: 119277,
        name: "Baldur's Gate 3",
        slug: 'baldurs-gate-3',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
        rating: 4.9,
        releaseYear: '2023',
        genres: ['RPG', 'Estratégia', 'Turno']
      },
      {
        id: 1942,
        name: 'The Witcher 3: Wild Hunt',
        slug: 'the-witcher-3-wild-hunt',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.webp',
        rating: 4.9,
        releaseYear: '2015',
        genres: ['RPG', 'Mundo Aberto', 'Ação']
      },
      {
        id: 25076,
        name: 'Red Dead Redemption 2',
        slug: 'red-dead-redemption-2',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
        rating: 4.9,
        releaseYear: '2018',
        genres: ['Ação', 'Mundo Aberto', 'Aventura']
      },
      {
        id: 1877,
        name: 'Cyberpunk 2077',
        slug: 'cyberpunk-2077',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaih8.webp',
        rating: 4.4,
        releaseYear: '2020',
        genres: ['RPG', 'Ficção Científica', 'Ação']
      },
      {
        id: 19560,
        name: 'God of War (2018)',
        slug: 'god-of-war--1',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobkt6.webp',
        rating: 4.8,
        releaseYear: '2018',
        genres: ['Ação', 'Mitologia', 'Aventura']
      }
    ]
  },
  {
    id: 'list_curated_2',
    slug: 'souls-likes-essenciais',
    name: 'Souls-likes & Desafios Brutais',
    description: 'Jogos para quem ama aprender cada padrão de ataque e superar chefes impiedosos.',
    ownerUsername: 'joysticked',
    ownerDisplayName: 'Joysticked',
    ownerAvatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=joysticked',
    isPublic: true,
    likesCount: 189,
    tags: ['Souls-like', 'Hardcore', 'RPG de Ação'],
    createdAt: '2024-02-14T10:00:00Z',
    updatedAt: '2024-06-01T16:00:00Z',
    gameCount: 5,
    games: [
      {
        id: 119133,
        name: 'Elden Ring',
        slug: 'elden-ring',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
        rating: 4.8,
        releaseYear: '2022',
        genres: ['RPG', 'Souls-like']
      },
      {
        id: 11133,
        name: 'Dark Souls III',
        slug: 'dark-souls-iii',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9ed.webp',
        rating: 4.7,
        releaseYear: '2016',
        genres: ['RPG', 'Souls-like']
      },
      {
        id: 76882,
        name: 'Sekiro: Shadows Die Twice',
        slug: 'sekiro-shadows-die-twice',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2a23.webp',
        rating: 4.8,
        releaseYear: '2019',
        genres: ['Ação', 'Souls-like']
      },
      {
        id: 148241,
        name: 'Lies of P',
        slug: 'lies-of-p',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6lxr.webp',
        rating: 4.5,
        releaseYear: '2023',
        genres: ['RPG', 'Souls-like']
      },
      {
        id: 7334,
        name: 'Bloodborne',
        slug: 'bloodborne',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob99l.webp',
        rating: 4.9,
        releaseYear: '2015',
        genres: ['RPG', 'Souls-like']
      }
    ]
  },
  {
    id: 'list_curated_3',
    slug: 'joias-indie-inesqueciveis',
    name: 'Joias Indie Inesquecíveis',
    description: 'Experiências autorais, trilhas sonoras memoráveis e gameplay inovador.',
    ownerUsername: 'joysticked',
    ownerDisplayName: 'Joysticked',
    ownerAvatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=joysticked',
    isPublic: true,
    likesCount: 215,
    tags: ['Indie', 'Arte', 'Metroidvania'],
    createdAt: '2024-03-02T18:00:00Z',
    updatedAt: '2024-06-12T11:20:00Z',
    gameCount: 5,
    games: [
      {
        id: 14593,
        name: 'Hollow Knight',
        slug: 'hollow-knight',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp',
        rating: 4.9,
        releaseYear: '2017',
        genres: ['Indie', 'Metroidvania', 'Plataforma']
      },
      {
        id: 113112,
        name: 'Hades',
        slug: 'hades',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9kr.webp',
        rating: 4.8,
        releaseYear: '2020',
        genres: ['Indie', 'Roguelike', 'Ação']
      },
      {
        id: 26226,
        name: 'Celeste',
        slug: 'celeste',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cob9dh.webp',
        rating: 4.8,
        releaseYear: '2018',
        genres: ['Indie', 'Plataforma', 'Narrativa']
      },
      {
        id: 26855,
        name: 'Dead Cells',
        slug: 'dead-cells',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7jfv.webp',
        rating: 4.6,
        releaseYear: '2018',
        genres: ['Indie', 'Roguelike', 'Ação']
      },
      {
        id: 26472,
        name: 'Disco Elysium',
        slug: 'disco-elysium',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1sfj.webp',
        rating: 4.9,
        releaseYear: '2019',
        genres: ['Indie', 'RPG', 'Narrativa']
      }
    ]
  }
];

const STORAGE_KEY = 'joysticked_custom_user_lists';
const LIKES_STORAGE_KEY = 'joysticked_liked_lists';

export function getLocalStoredLists(): UserList[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserList[];
  } catch {
    return [];
  }
}

export function saveLocalStoredLists(lists: UserList[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (e) {
    console.error('Failed to save lists:', e);
  }
}

export function getAllLists(): UserList[] {
  const customLists = getLocalStoredLists();
  // Merge custom lists first, followed by curated defaults
  const customSlugs = new Set(customLists.map((l) => `${l.ownerUsername.toLowerCase()}/${l.slug.toLowerCase()}`));
  const defaults = DEFAULT_COMMUNITY_LISTS.filter(
    (l) => !customSlugs.has(`${l.ownerUsername.toLowerCase()}/${l.slug.toLowerCase()}`)
  );
  return [...customLists, ...defaults];
}

export function getUserLists(username: string): UserList[] {
  const all = getAllLists();
  const normalized = username.toLowerCase().trim();
  return all.filter((l) => l.ownerUsername.toLowerCase() === normalized);
}

export function getListByUserAndSlug(username: string, listSlug: string): UserList | null {
  const all = getAllLists();
  const normalizedUser = username.toLowerCase().trim();
  const normalizedSlug = listSlug.toLowerCase().trim();

  // Try exact user + slug match
  const found = all.find(
    (l) =>
      l.ownerUsername.toLowerCase() === normalizedUser &&
      (l.slug.toLowerCase() === normalizedSlug || l.id === normalizedSlug)
  );
  if (found) return found;

  // Fallback: match by slug only (e.g. curated list or direct link)
  const bySlugOnly = all.find((l) => l.slug.toLowerCase() === normalizedSlug || l.id === normalizedSlug);
  return bySlugOnly || null;
}

export function createCustomList(params: {
  name: string;
  description?: string;
  ownerUsername: string;
  ownerDisplayName?: string;
  ownerAvatarUrl?: string;
  isPublic?: boolean;
  tags?: string[];
  initialGames?: Game[];
}): UserList {
  const slug = params.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || `lista-${Date.now()}`;

  const games = params.initialGames || [];

  const newList: UserList = {
    id: `list_${Date.now()}`,
    slug,
    name: params.name.trim(),
    description: params.description?.trim() || null,
    ownerUsername: params.ownerUsername,
    ownerDisplayName: params.ownerDisplayName || params.ownerUsername,
    ownerAvatarUrl:
      params.ownerAvatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${params.ownerUsername}`,
    isPublic: params.isPublic ?? true,
    coverUrl: games[0]?.coverUrl || null,
    games,
    gameCount: games.length,
    likesCount: 0,
    tags: params.tags && params.tags.length > 0 ? params.tags : ['Personalizada'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const stored = getLocalStoredLists();
  const updated = [newList, ...stored];
  saveLocalStoredLists(updated);
  return newList;
}

export function addGameToUserList(listId: string, game: Game): UserList | null {
  const stored = getLocalStoredLists();
  const index = stored.findIndex((l) => l.id === listId || l.slug === listId);

  if (index >= 0) {
    const list = stored[index];
    if (list.games.some((g) => (g.slug || g.id) === (game.slug || game.id))) {
      return list; // already added
    }
    const updatedGames = [...list.games, game];
    const updatedList: UserList = {
      ...list,
      games: updatedGames,
      gameCount: updatedGames.length,
      coverUrl: list.coverUrl || game.coverUrl,
      updatedAt: new Date().toISOString()
    };
    stored[index] = updatedList;
    saveLocalStoredLists(stored);
    return updatedList;
  }

  // If modifying a curated default list, clone it into custom stored lists for the user
  const defaultList = DEFAULT_COMMUNITY_LISTS.find((l) => l.id === listId || l.slug === listId);
  if (defaultList) {
    if (defaultList.games.some((g) => (g.slug || g.id) === (game.slug || game.id))) {
      return defaultList;
    }
    const updatedGames = [...defaultList.games, game];
    const clonedList: UserList = {
      ...defaultList,
      games: updatedGames,
      gameCount: updatedGames.length,
      updatedAt: new Date().toISOString()
    };
    saveLocalStoredLists([clonedList, ...stored]);
    return clonedList;
  }

  return null;
}

export function removeGameFromUserList(listId: string, gameSlugOrId: string | number): UserList | null {
  const stored = getLocalStoredLists();
  const index = stored.findIndex((l) => l.id === listId || l.slug === listId);

  if (index >= 0) {
    const list = stored[index];
    const updatedGames = list.games.filter(
      (g) => g.slug !== gameSlugOrId && g.id !== gameSlugOrId
    );
    const updatedList: UserList = {
      ...list,
      games: updatedGames,
      gameCount: updatedGames.length,
      coverUrl: updatedGames[0]?.coverUrl || null,
      updatedAt: new Date().toISOString()
    };
    stored[index] = updatedList;
    saveLocalStoredLists(stored);
    return updatedList;
  }
  return null;
}

export function deleteUserList(listId: string): boolean {
  const stored = getLocalStoredLists();
  const filtered = stored.filter((l) => l.id !== listId && l.slug !== listId);
  saveLocalStoredLists(filtered);
  return filtered.length < stored.length;
}

export function isListLiked(listId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    if (!raw) return false;
    const liked = JSON.parse(raw) as string[];
    return liked.includes(listId);
  } catch {
    return false;
  }
}

export function toggleLikeList(listId: string, currentCount: number): { isLiked: boolean; likesCount: number } {
  if (typeof window === 'undefined') return { isLiked: false, likesCount: currentCount };
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    const liked: string[] = raw ? JSON.parse(raw) : [];
    const isAlreadyLiked = liked.includes(listId);

    let nextLiked: string[];
    let nextCount = currentCount;

    if (isAlreadyLiked) {
      nextLiked = liked.filter((id) => id !== listId);
      nextCount = Math.max(0, currentCount - 1);
    } else {
      nextLiked = [...liked, listId];
      nextCount = currentCount + 1;
    }

    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(nextLiked));
    return { isLiked: !isAlreadyLiked, likesCount: nextCount };
  } catch {
    return { isLiked: false, likesCount: currentCount };
  }
}
