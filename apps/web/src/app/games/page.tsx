import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { TopNav } from '@/components/navigation/top-nav';
import { getPopularGames } from '@/lib/games';

export const metadata: Metadata = {
  title: 'Jogos | Joysticked',
  description: 'Explore jogos populares e encontre seu próximo título.'
};

export default async function GamesPage() {
  const games = await getPopularGames(24);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-16 pt-24 text-neutral-100 sm:px-6">
      <TopNav />
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Catálogo</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">Explore jogos</h1>
          <p className="mt-2 text-sm text-neutral-400">Descubra títulos populares para adicionar à sua próxima sessão.</p>
        </div>
        {games.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-neutral-400">
            O catálogo está temporariamente indisponível. Tente novamente em instantes.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {games.map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`} className="group">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-neutral-900">
                  {game.coverUrl ? (
                    <Image src={game.coverUrl} alt={game.name} fill sizes="(min-width: 1024px) 16vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-center text-xs text-neutral-500">Sem capa</div>
                  )}
                </div>
                <h2 className="mt-2 line-clamp-2 text-sm font-semibold text-white group-hover:text-neutral-300">{game.name}</h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
