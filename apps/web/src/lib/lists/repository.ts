import type { Game } from '@/lib/games/types';
import { DEFAULT_COMMUNITY_LISTS } from './defaults';
import { createListSlug, normalizeListIdentifier } from './normalization';
import {
  readLikedListIds,
  readStoredLists,
  writeLikedListIds,
  writeStoredLists
} from './persistence';
import type { UserList } from './types';

export function getAllLists(): UserList[] {
  const customLists = readStoredLists().filter(
    (l) => l.ownerUsername.toLowerCase() !== 'joysticked'
  );
  return [...DEFAULT_COMMUNITY_LISTS, ...customLists];
}

export function getUserLists(username: string): UserList[] {
  const all = getAllLists();
  const normalized = normalizeListIdentifier(username);
  return all.filter((l) => l.ownerUsername.toLowerCase() === normalized);
}

export function getListByUserAndSlug(username: string, listSlug: string): UserList | null {
  const all = getAllLists();
  const normalizedUser = normalizeListIdentifier(username);
  const normalizedSlug = normalizeListIdentifier(listSlug);

  // Try exact user + slug match
  const found = all.find(
    (l) =>
      (!normalizedUser || l.ownerUsername.toLowerCase() === normalizedUser) &&
      (l.slug.toLowerCase() === normalizedSlug || l.id === normalizedSlug)
  );
  if (found) return found;

  // Fallback: match by slug only (e.g. curated list or direct link)
  const bySlugOnly = all.find(
    (l) => l.slug.toLowerCase() === normalizedSlug || l.id === normalizedSlug
  );
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
  const slug = createListSlug(params.name);

  const games = params.initialGames || [];

  const newList: UserList = {
    id: `list_${Date.now()}`,
    slug,
    name: params.name.trim(),
    description: params.description?.trim() || null,
    ownerUsername: params.ownerUsername,
    ownerDisplayName: params.ownerDisplayName || params.ownerUsername,
    ownerAvatarUrl:
      params.ownerAvatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${params.ownerUsername}`,
    isPublic: params.isPublic ?? true,
    coverUrl: games[0]?.coverUrl || null,
    games,
    gameCount: games.length,
    likesCount: 0,
    tags: params.tags && params.tags.length > 0 ? params.tags : ['Personalizada'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const stored = readStoredLists();
  const updated = [newList, ...stored];
  writeStoredLists(updated);
  return newList;
}

export function addGameToUserList(listId: string, game: Game): UserList | null {
  const stored = readStoredLists();
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
    writeStoredLists(stored);
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
    writeStoredLists([clonedList, ...stored]);
    return clonedList;
  }

  return null;
}

export function removeGameFromUserList(
  listId: string,
  gameSlugOrId: string | number
): UserList | null {
  const stored = readStoredLists();
  const index = stored.findIndex((l) => l.id === listId || l.slug === listId);

  if (index >= 0) {
    const list = stored[index];
    const updatedGames = list.games.filter((g) => g.slug !== gameSlugOrId && g.id !== gameSlugOrId);
    const updatedList: UserList = {
      ...list,
      games: updatedGames,
      gameCount: updatedGames.length,
      coverUrl: updatedGames[0]?.coverUrl || null,
      updatedAt: new Date().toISOString()
    };
    stored[index] = updatedList;
    writeStoredLists(stored);
    return updatedList;
  }
  return null;
}

export function updateUserList(
  listId: string,
  params: {
    name: string;
    description?: string;
    isPublic?: boolean;
    tags?: string[];
  }
): UserList | null {
  const stored = readStoredLists();
  const index = stored.findIndex((l) => l.id === listId || l.slug === listId);

  if (index >= 0) {
    const list = stored[index];
    const updatedList: UserList = {
      ...list,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      isPublic: params.isPublic ?? list.isPublic,
      tags: params.tags || list.tags,
      updatedAt: new Date().toISOString()
    };
    stored[index] = updatedList;
    writeStoredLists(stored);
    return updatedList;
  }

  // If modifying a curated default list, clone it into custom stored lists for the user
  const defaultList = DEFAULT_COMMUNITY_LISTS.find((l) => l.id === listId || l.slug === listId);
  if (defaultList) {
    const clonedList: UserList = {
      ...defaultList,
      name: params.name.trim(),
      description: params.description?.trim() || null,
      isPublic: params.isPublic ?? defaultList.isPublic,
      tags: params.tags || defaultList.tags,
      updatedAt: new Date().toISOString()
    };
    writeStoredLists([clonedList, ...stored]);
    return clonedList;
  }

  return null;
}

export function deleteUserList(listId: string): boolean {
  const stored = readStoredLists();
  const filtered = stored.filter((l) => l.id !== listId && l.slug !== listId);
  writeStoredLists(filtered);
  return filtered.length < stored.length;
}

export function isListLiked(listId: string): boolean {
  return readLikedListIds().includes(listId);
}

export function toggleLikeList(
  listId: string,
  currentCount: number
): { isLiked: boolean; likesCount: number } {
  const liked = readLikedListIds();
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

  writeLikedListIds(nextLiked);
  return { isLiked: !isAlreadyLiked, likesCount: nextCount };
}
