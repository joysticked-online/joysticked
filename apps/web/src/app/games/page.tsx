import type { Metadata } from 'next';
import { getPopularGames, getPopularNewReleases, getTopRatedGames } from '@/lib/games';
import { GamesExplorerView } from './games-explorer-view';

export const metadata: Metadata = {
  title: 'Explorar Jogos | Joysticked',
  description:
    'Descubra jogos populares, busque títulos pelo IGDB, veja plataformas disponíveis e compartilhe suas avaliações.'
};

export default async function GamesPage() {
  const [popularGames, topRatedGames, newReleases] = await Promise.all([
    getPopularGames(21),
    getTopRatedGames(21),
    getPopularNewReleases(21)
  ]);

  return (
    <GamesExplorerView
      initialPopularGames={popularGames}
      initialTopRatedGames={topRatedGames}
      initialUpcomingGames={newReleases}
    />
  );
}
