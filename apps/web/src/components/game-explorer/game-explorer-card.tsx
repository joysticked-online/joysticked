'use client';

import { Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { PosterImage } from '@/components/ui/poster-image';
import type { Game } from '@/lib/games';

export function GameExplorerCard({ game }: { game: Game }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.025 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link
        href={`/games/${game.slug}`}
        className="group relative block aspect-[2/3] cursor-pointer overflow-hidden rounded-xl border border-white/[0.04] bg-neutral-900 shadow-md transition-all hover:border-white/20 hover:shadow-[0_12px_28px_rgba(0,0,0,0.8)]"
      >
        <PosterImage src={game.coverUrl} alt={game.name} />
        {game.isSteamNewRelease ? (
          <Badge tone="emerald">
            <Sparkles className="size-2" />
            Steam
          </Badge>
        ) : game.isSteamAwaited ? (
          <Badge tone="amber">
            <Sparkles className="size-2" />
            Aguardado
          </Badge>
        ) : game.rating ? (
          <Badge tone="rating">
            <Star className="size-2 fill-amber-300 text-amber-300" />
            {game.rating.toFixed(1)}
          </Badge>
        ) : game.releaseYear ? (
          <div className="absolute top-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 font-semibold text-[8.5px] text-neutral-300 backdrop-blur-md">
            {game.releaseYear}
          </div>
        ) : null}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/25 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="line-clamp-2 font-semibold text-[11px] text-white leading-tight">
            {game.name}
          </span>
          {game.genres?.[0] && (
            <span className="mt-0.5 truncate text-[9px] text-neutral-400">{game.genres[0]}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone: 'emerald' | 'amber' | 'rating' }) {
  const styles = {
    emerald: 'border-emerald-500/30 text-emerald-400',
    amber: 'border-amber-500/30 text-amber-400',
    rating: 'border-transparent text-amber-300'
  };
  return (
    <div
      className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md border bg-black/80 px-1.5 py-0.5 font-bold text-[8.5px] shadow backdrop-blur-md ${styles[tone]}`}
    >
      {children}
    </div>
  );
}
