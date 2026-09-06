import type { Metadata } from 'next';
import { getPopularGames } from '@/lib/games';
import { GamesExplorerView } from './games-explorer-view';

export const metadata: Metadata = {
  title: 'Explorar Jogos | Joysticked',
  description: 'Descubra jogos populares, busque títulos pelo IGDB, veja plataformas disponíveis e compartilhe suas avaliações.'
};

export default async function GamesPage() {
  const popularGames = await getPopularGames(18);

  return <GamesExplorerView initialPopularGames={popularGames} />;
}
