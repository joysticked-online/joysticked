import { migrateLikedListIds, migrateStoredLists } from './migration';
import type { UserList } from './types';

const STORAGE_KEY = 'joysticked_custom_user_lists';
const LIKES_STORAGE_KEY = 'joysticked_liked_lists';

export function readStoredLists(): UserList[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? migrateStoredLists(JSON.parse(raw)) : [];
  } catch (error) {
    console.error('Failed to read lists:', error);
    return [];
  }
}

export function writeStoredLists(lists: UserList[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
  } catch (error) {
    console.error('Failed to save lists:', error);
  }
}

export function readLikedListIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    return raw ? migrateLikedListIds(JSON.parse(raw)) : [];
  } catch (error) {
    console.error('Failed to read liked lists:', error);
    return [];
  }
}

export function writeLikedListIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Failed to save liked lists:', error);
  }
}
