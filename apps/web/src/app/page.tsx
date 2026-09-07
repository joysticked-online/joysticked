import type { Metadata } from 'next';
import { HomeView } from '@/components/home/home-view';
import { getHomeFeed } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Início | Joysticked',
  description: 'Visão geral de suas atividades e tendências no Joysticked.'
};

export default async function HomePage() {
  const initialData = await getHomeFeed();

  return <HomeView initialData={initialData} />;
}
