import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ListView } from './list-view';

export const metadata: Metadata = {
  title: 'Lista de Jogos | Joysticked',
  description:
    'Explore listas personalizadas e coleções de jogos criadas pela comunidade do Joysticked.'
};

export default function ListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400 text-xs">
          Carregando lista...
        </div>
      }
    >
      <ListView />
    </Suspense>
  );
}
