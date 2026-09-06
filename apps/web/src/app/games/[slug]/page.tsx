import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGameDetails } from '@/lib/games';
import { GameDetailView } from '@/components/game/game-detail-view';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getGameDetails(slug);

  if (!data?.game) {
    return {
      title: 'Jogo não encontrado | Joysticked'
    };
  }

  const { game } = data;
  return {
    title: `${game.name} (${game.releaseYear || 'Jogo'}) | Joysticked`,
    description: game.summary || `Confira detalhes, avaliações e onde jogar ${game.name} no Joysticked.`,
    openGraph: {
      title: game.name,
      description: game.summary || '',
      images: game.bannerUrl ? [game.bannerUrl] : game.coverUrl ? [game.coverUrl] : []
    }
  };
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  const data = await getGameDetails(slug);

  if (!data || !data.game) {
    notFound();
  }

  return (
    <GameDetailView
      game={data.game}
      initialReviews={data.reviews || []}
      initialActivities={data.activities || []}
    />
  );
}
