/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { PixelHeart } from '@/components/landing/pixel-heart';
import type { GameReview } from '@/lib/games';
import type { ProfileGame } from '../types';

type ReviewsTabProps = {
  displayGames: ProfileGame[];
  localReviews?: GameReview[];
};

export function ReviewsTab({ displayGames }: ReviewsTabProps) {
  const reviewedGames = displayGames.filter((g) => g.rating);

  if (reviewedGames.length === 0) {
    return (
      <motion.div
        key="reviews-empty"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center gap-4 rounded-2xl bg-white/[0.02] p-12 text-center ring-1 ring-white/[0.05]"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08]">
          <Star className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-white">Nenhuma avaliação ainda</p>
          <p className="max-w-xs text-xs text-zinc-400 [text-wrap:pretty]">
            Avalie os jogos que você já jogou para construir seu histórico de críticas e notas.
          </p>
        </div>
        <Link
          href="/games"
          className="mt-1 rounded-xl bg-white px-4 py-2 font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96]"
        >
          Explorar jogos
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className="space-y-3"
    >
      {reviewedGames.map((game) => (
        <article
          key={game.id}
          className="group flex items-start gap-4 rounded-2xl bg-white/[0.02] p-4 ring-1 ring-white/[0.04] transition-all hover:bg-white/[0.04] hover:ring-white/[0.08]"
        >
          {/* Game Cover Thumbnail with 1px rim */}
          <Link
            href={`/games/${game.id}`}
            className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900 shadow-md ring-1 ring-white/10 focus:outline-hidden"
          >
            <img
              src={game.coverUrl}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-250 ease-out group-hover:scale-[1.05]"
            />
          </Link>

          {/* Review Details */}
          <div className="flex-1 space-y-2 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/games/${game.id}`}
                    className="font-bold font-sans text-base text-white tracking-tight transition-colors hover:text-zinc-200"
                  >
                    {game.title}
                  </Link>
                  <span className="font-mono text-xs text-zinc-500">{game.year}</span>
                </div>

                {/* Rating Stars / Score */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const ratingVal = game.rating || 5;
                    const isFull = ratingVal >= i + 1;
                    const isHalf = !isFull && ratingVal >= i + 0.5;
                    return (
                      <PixelHeart
                        key={i}
                        size={12}
                        variant={isFull ? 'full' : isHalf ? 'half' : 'empty'}
                        color="#ffffff"
                      />
                    );
                  })}
                  <span className="ml-1.5 font-bold font-mono text-white text-xs tabular-nums">
                    {game.rating?.toFixed(1)}
                  </span>
                </div>
              </div>

              <span className="shrink-0 font-mono text-[11px] text-zinc-500 tabular-nums">
                {game.completedDate || 'recente'}
              </span>
            </div>

            {/* Review Snippet / Text */}
            {game.reviewSnippet && (
              <p className="text-xs text-zinc-300 leading-relaxed [text-wrap:pretty]">
                "{game.reviewSnippet}"
              </p>
            )}

            {/* Platform / Hours Tag */}
            <div className="flex items-center gap-2 pt-0.5">
              {game.platformTag && (
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/[0.06]">
                  {game.platformTag}
                </span>
              )}
              {game.hours && (
                <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                  {game.hours}h registradas
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </motion.div>
  );
}
