import type { Game } from '@/lib/games';
import type { UserList } from '@/lib/lists';

export type ViewMode = 'grid' | 'detailed' | 'compact';

export function getListStats(list: UserList | null) {
  if (!list || list.games.length === 0) return { avgRating: 0, topGenres: [] as string[] };

  const ratings = list.games.map((game) => game.rating || 0).filter((rating) => rating > 0);
  const avgRating = ratings.length
    ? (ratings.reduce((total, rating) => total + rating, 0) / ratings.length).toFixed(1)
    : '5.0';
  const genreCounts = new Map<string, number>();
  for (const game of list.games) {
    for (const genre of game.genres || []) {
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    }
  }
  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);

  return { avgRating, topGenres };
}

export function hasGame(list: UserList, game: Game): boolean {
  return list.games.some(
    (currentGame) => (currentGame.slug || currentGame.id) === (game.slug || game.id)
  );
}
