'use client';

import { ArrowRight, Flame, Gamepad2, Star, ThumbsUp } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { Game } from '@/lib/games';

interface GameRecommendedTabProps {
  currentGame: Game;
  recommendedGames?: Game[];
}

export function GameRecommendedTab({
  currentGame,
  recommendedGames = []
}: GameRecommendedTabProps) {
  const gamesList =
    recommendedGames.length > 0
      ? recommendedGames
      : currentGame.recommendedGames && currentGame.recommendedGames.length > 0
        ? currentGame.recommendedGames
        : [];

  if (gamesList.length === 0) {
    return (
      <div className="space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 text-center">
        <Gamepad2 className="mx-auto size-10 text-neutral-600" />
        <h4 className="font-bold text-base text-white">Nenhuma recomendação disponível</h4>
        <p className="mx-auto max-w-md text-neutral-400 text-xs leading-relaxed">
          Estamos compilando sugestões personalizadas para jogadores de{' '}
          <strong className="text-white">{currentGame.name}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 px-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-inner">
            <ThumbsUp className="size-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Recomendados para Você</h3>
            <p className="text-neutral-400 text-xs">
              Seleção de jogos altamente aclamados que fãs de {currentGame.name} também amam.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-400 text-xs">
          <Flame className="size-3.5" />
          <span>Curadoria Joysticked</span>
        </div>
      </div>

      {/* Grid of Recommended Games */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4">
        {gamesList.map((game, idx) => {
          const cover =
            game.coverUrl ||
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';
          const ratingFormatted = game.rating ? Number(game.rating).toFixed(1) : null;

          return (
            <motion.div
              key={game.id || game.slug || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
            >
              <Link
                href={`/games/${game.slug}`}
                className="group hover:-translate-y-1 relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10"
              >
                {/* Poster Artwork Container */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={cover}
                    alt={game.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  {/* Rating Badge */}
                  {ratingFormatted && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg border border-white/10 bg-black/70 px-2 py-0.5 font-bold text-[11px] text-amber-300 shadow-md backdrop-blur-md">
                      <Star className="size-3 fill-amber-300 text-amber-300" />
                      <span>{ratingFormatted}</span>
                    </div>
                  )}

                  {/* Top Community Badge */}
                  <div className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-500/80 px-2 py-0.5 font-bold text-[10px] text-white shadow-sm backdrop-blur-md">
                    Recomendado
                  </div>

                  {/* Hover Overlay with Arrow */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex size-10 translate-y-2 transform items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform group-hover:translate-y-0">
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-1 flex-col justify-between space-y-1.5 p-3.5">
                  <div>
                    <h4 className="line-clamp-1 font-bold text-white text-xs transition-colors group-hover:text-emerald-300 sm:text-sm">
                      {game.name}
                    </h4>

                    {game.genres && game.genres.length > 0 && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-neutral-400">
                        {game.genres.slice(0, 2).join(' • ')}
                      </p>
                    )}
                  </div>

                  {game.releaseYear && (
                    <div className="flex items-center justify-between border-white/[0.04] border-t pt-1 text-[10px] text-neutral-500">
                      <span>Lançamento</span>
                      <span className="font-medium text-neutral-400">{game.releaseYear}</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
