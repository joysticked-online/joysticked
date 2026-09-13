import type { IgdbGame } from '../types';

const SEARCH_FILLER_WORDS = new Set([
  'a',
  'an',
  'and',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'for',
  'in',
  'of',
  'on',
  'the',
  'to'
]);

export const IGDB_FORBIDDEN_PATTERNS = [
  'game of the year',
  'goty',
  'expansion',
  'dlc',
  'season pass',
  'expansion pass',
  'deluxe edition',
  'complete edition',
  'ultimate edition',
  'gold edition',
  'silver edition',
  "collector's edition",
  'collectors edition',
  'special edition',
  'definitive edition',
  'anniversary edition',
  'enhanced edition',
  'soundtrack',
  'artbook',
  'booster pack',
  'skin pack',
  'character pack',
  'dlc pack',
  'upgrade pack',
  'bonus content',
  'add-on',
  'starter pack',
  'founders pack',
  'battle pass',
  'bundle',
  'digital soundtrack',
  'original soundtrack',
  'shadow of the erdtree'
] as const;

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function removeSearchFillers(value: string): string {
  return value
    .split(' ')
    .filter((word) => word && !SEARCH_FILLER_WORDS.has(word))
    .join(' ');
}

export function getSearchRelevance(game: Pick<IgdbGame, 'name' | 'slug'>, query: string): number {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedName = normalizeSearchText(game.name);
  const normalizedSlug = normalizeSearchText(game.slug);
  const compactQuery = removeSearchFillers(normalizedQuery);
  const compactName = removeSearchFillers(normalizedName);

  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery || normalizedSlug === normalizedQuery) return 100;
  if (compactName === compactQuery) return 95;
  if (normalizedName.startsWith(normalizedQuery)) return 90;
  if (normalizedName.split(' ').some((word) => word.startsWith(normalizedQuery))) return 80;
  if (normalizedName.includes(normalizedQuery) || normalizedSlug.includes(normalizedQuery)) return 70;
  if (compactQuery.length > 1 && compactName.startsWith(compactQuery)) return 85;

  return 0;
}

export function isForbiddenGame(
  name?: string | null,
  slug?: string | null,
  category?: number
): boolean {
  if (typeof category === 'number' && category !== 0 && category !== 8 && category !== 9) {
    return true;
  }

  const normalizedName = (name ?? '').toLowerCase();
  const normalizedSlug = (slug ?? '').toLowerCase();
  return IGDB_FORBIDDEN_PATTERNS.some(
    (pattern) => normalizedName.includes(pattern) || normalizedSlug.includes(pattern)
  );
}
