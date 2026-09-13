import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ListsHubView } from './lists-hub-view';

export const metadata: Metadata = {
  title: 'Listas e Coleções de Jogos | Joysticked',
  description:
    'Explore, crie e compartilhe listas personalizadas de videogames com a comunidade do Joysticked.'
};

export default function ListsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 text-xs">
          Carregando listas...
        </div>
      }
    >
      <ListsHubView />
    </Suspense>
  );
}
