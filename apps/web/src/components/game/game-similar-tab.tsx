'use client';

import { ArrowUpRight, Gamepad2, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Game } from '@/lib/games';

interface GameSimilarTabProps {
  currentGame: Game;
  similarGames?: Game[];
}

function SimilarGameCard({ game, idx }: { game: Game; idx: number }) {
  const [isHovered, setIsHovered] = useState(false);

  const cover =
    game.coverUrl ||
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';
  const ratingFormatted = game.rating ? Number(game.rating).toFixed(1) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: idx * 0.012 }}
      className="flex justify-center"
    >
      <Link
        href={`/games/${game.slug}`}
        title={game.name}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative block aspect-[3/4] w-full max-w-[155px] cursor-pointer select-none overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-950"
      >
        {/* Card Container (btn-28 spring expand) */}
        <motion.div
          animate={{
            scale: isHovered ? 1.04 : 1
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="relative h-full w-full overflow-hidden rounded-xl"
        >
          {/* Poster Image with Depth Zoom */}
          <motion.div
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute inset-0"
          >
            <Image
              src={cover}
              alt={game.name}
              fill
              sizes="(max-width: 480px) 45vw, (max-width: 768px) 25vw, 155px"
              className="object-cover"
            />
          </motion.div>

          {/* Vignette Gradients */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

          {/* Rating Badge */}
          {ratingFormatted && (
            <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 rounded border border-white/10 bg-black/85 px-1.5 py-0.5 font-bold text-[8.5px] text-amber-300 shadow-sm backdrop-blur-md">
              <Star className="size-2 fill-amber-300 text-amber-300" />
              <span>{ratingFormatted}</span>
            </div>
          )}

          {/* Release Year */}
          {game.releaseYear && (
            <div className="absolute top-1.5 left-1.5 z-10 rounded border border-white/10 bg-black/75 px-1.5 py-0.5 font-medium text-[8px] text-neutral-300 backdrop-blur-md">
              {game.releaseYear}
            </div>
          )}

          {/* Center Morph Action Button (amicro btn-28 morph spring pattern) */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              {isHovered && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                  className="flex size-8 items-center justify-center rounded-full border border-white/40 bg-white/95 text-black shadow-black/50 shadow-xl backdrop-blur-md"
                >
                  <ArrowUpRight className="size-3.5 stroke-[2.5]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Title Morph Bar (Smooth Slide Up on Hover) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-1.5">
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="rounded-md border border-white/15 bg-black/80 px-1.5 py-1 text-center shadow-lg backdrop-blur-md"
                >
                  <p className="line-clamp-1 font-semibold text-[10px] text-white leading-tight">
                    {game.name}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Luminous Hover Border Ring (Expand Ring effect) */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 rounded-xl border border-white/40 shadow-[inset_0_0_12px_rgba(255,255,255,0.15)]"
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function GameSimilarTab({ currentGame, similarGames = [] }: GameSimilarTabProps) {
  const gamesList =
    similarGames.length > 0
      ? similarGames
      : currentGame.similarGames && currentGame.similarGames.length > 0
        ? currentGame.similarGames
        : [];

  if (gamesList.length === 0) {
    return (
      <div className="space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 text-center">
        <Gamepad2 className="mx-auto size-10 text-neutral-600" />
        <h4 className="font-bold text-base text-white">Nenhum jogo similar encontrado</h4>
        <p className="mx-auto max-w-md text-neutral-400 text-xs leading-relaxed">
          Ainda estamos catalogando títulos com características semelhantes a{' '}
          <strong className="text-white">{currentGame.name}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of Similar Games - 5 in a row, compact, closer and pure posters */}
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-1.5 sm:grid-cols-5 sm:gap-2 md:grid-cols-5 min-[420px]:grid-cols-3">
        {gamesList.map((game, idx) => (
          <SimilarGameCard key={game.id || game.slug || idx} game={game} idx={idx} />
        ))}
      </div>
    </div>
  );
}
