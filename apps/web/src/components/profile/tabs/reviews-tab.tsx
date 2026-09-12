'use client';

import { motion } from 'motion/react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { PixelHeart } from '@/components/landing/pixel-heart';
import type { ProfileGame } from '../types';

type ReviewsTabProps = {
  displayGames: ProfileGame[];
};

export function ReviewsTab({ displayGames }: ReviewsTabProps) {
  const reviewedGames = displayGames.filter((g) => g.rating);

  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="divide-y divide-white/[0.04]"
    >
      {reviewedGames.map((game) => (
        <article
          key={game.id}
          className="group flex items-start gap-4 py-4 transition-colors first:pt-0 last:pb-0"
        >
          {/* Game Cover Thumbnail */}
          <Link
            href={`/games/${game.id}`}
            className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-900 shadow-md ring-1 ring-white/10 focus:outline-hidden"
          >
            <img
              src={game.coverUrl}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Review Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/games/${game.id}`}
                    className="font-semibold text-sm text-white transition-colors focus:outline-hidden group-hover:text-indigo-400"
                  >
                    {game.title}
                  </Link>
                  <span className="text-neutral-500 text-xs">{game.year}</span>
                </div>

                {/* Pixel Hearts */}
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
                        color="#EF4444"
                      />
                    );
                  })}
                  <span className="ml-1 font-mono font-medium text-[11px] text-neutral-400">
                    {game.rating?.toFixed(1)}
                  </span>
                </div>
              </div>

              <span className="shrink-0 text-[11px] text-neutral-500">
                {game.completedDate || 'há 2 dias'}
              </span>
            </div>

            {/* Review Content */}
            {game.reviewSnippet && (
              <p className="text-neutral-300 text-xs leading-relaxed">{game.reviewSnippet}</p>
            )}

            {/* Platform / Hours Tag */}
            <div className="flex items-center gap-2 pt-0.5">
              {game.platformTag && (
                <span className="rounded-md bg-white/[0.03] px-2 py-0.5 text-[10px] text-neutral-400">
                  {game.platformTag}
                </span>
              )}
              {game.hours && (
                <span className="text-[10px] text-neutral-500">{game.hours} registradas</span>
              )}
            </div>
          </div>
        </article>
      ))}
    </motion.div>
  );
}
