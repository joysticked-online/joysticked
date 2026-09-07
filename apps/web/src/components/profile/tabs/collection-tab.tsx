'use client';

import { BookOpen, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { CollectionFilter, ProfileGame } from '../types';

type CollectionTabProps = {
  displayGames: ProfileGame[];
};

export function CollectionTab({ displayGames }: CollectionTabProps) {
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');

  const counts = {
    all: displayGames.length,
    playing: displayGames.filter((g) => g.status.toLowerCase().includes('jogando')).length,
    completed: displayGames.filter(
      (g) =>
        g.status.toLowerCase().includes('concluído') || g.status.toLowerCase().includes('platin')
    ).length,
    backlog: displayGames.filter((g) => g.status.toLowerCase().includes('fila')).length
  };

  const filteredCollection = displayGames.filter((game) => {
    if (collectionFilter === 'playing') return game.status.toLowerCase().includes('jogando');
    if (collectionFilter === 'completed')
      return (
        game.status.toLowerCase().includes('concluído') ||
        game.status.toLowerCase().includes('platin')
      );
    if (collectionFilter === 'backlog') return game.status.toLowerCase().includes('fila');
    return true;
  });

  const FILTERS: { id: CollectionFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Todos', count: counts.all },
    { id: 'playing', label: 'Jogando', count: counts.playing },
    { id: 'completed', label: 'Concluídos', count: counts.completed },
    { id: 'backlog', label: 'Na Fila', count: counts.backlog }
  ];

  return (
    <div className="space-y-6">
      {/* Liquid Filter Capsule Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const isActive = collectionFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setCollectionFilter(f.id)}
              className={cn(
                'relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-medium text-xs transition-colors duration-150 active:scale-[0.96]',
                isActive
                  ? 'font-semibold text-black'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="liquidCollectionFilterPill"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 32
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{f.label}</span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 font-bold text-[9px] transition-colors',
                    isActive ? 'bg-black/15 text-black' : 'bg-white/[0.06] text-neutral-400'
                  )}
                >
                  {f.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Pure Edge-to-Edge Poster Grid (Letterboxd / Plotwist Style) */}
      {filteredCollection.length > 0 ? (
        <div className="grid grid-cols-3 gap-3.5 sm:grid-cols-4 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredCollection.map((item) => (
            <Link
              key={item.id}
              href={`/games/${item.id}`}
              className="group relative flex cursor-pointer flex-col space-y-1.5 focus:outline-hidden"
            >
              {/* Poster Image */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-900 shadow-md ring-1 ring-white/10 transition-all duration-200 group-hover:ring-white/25">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.04]"
                />

                {/* Rating Badge */}
                {item.rating && (
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded bg-black/75 px-1.5 py-0.5 font-bold text-[9px] text-amber-400 backdrop-blur-md">
                    <Star className="size-2.5 fill-current" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-0.5 px-0.5">
                <h4 className="truncate font-medium text-white text-xs transition-colors group-hover:text-indigo-400">
                  {item.title}
                </h4>
                <p className="truncate text-[10px] text-neutral-500">
                  {item.year} {item.platformTag ? `• ${item.platformTag}` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.01] p-12 text-center">
          <BookOpen className="mb-3 size-6 text-neutral-600" strokeWidth={1.5} />
          <h3 className="font-semibold text-sm text-white">Nenhum jogo nesta categoria</h3>
          <p className="mt-1 text-neutral-500 text-xs">
            Altere os filtros acima para visualizar o catálogo completo.
          </p>
        </div>
      )}
    </div>
  );
}
