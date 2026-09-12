/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { BarChart2, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import type { Profile, ProfileGame } from '../types';

type StatsTabProps = {
  genres: string[];
  displayGames?: ProfileGame[];
  profile?: Profile;
  isOwnProfile?: boolean;
};

export function StatsTab({
  genres,
  displayGames = [],
  profile,
  isOwnProfile = true
}: StatsTabProps) {
  const hasData = displayGames.length > 0;

  // If the user has no real game data, show a clean empty state
  if (!hasData) {
    return (
      <motion.div
        key="stats-empty"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-neutral-600">
          <BarChart2 className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-neutral-300">Nenhuma estatística ainda</p>
          <p className="max-w-xs text-[12px] text-neutral-500 leading-relaxed">
            As estatísticas aparecerão aqui conforme você registrar e avaliar jogos.
          </p>
        </div>
        <Link
          href="/games"
          className="mt-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          Explorar jogos
        </Link>
      </motion.div>
    );
  }

  // Genre distribution derived from actual user preferences
  const genreList = genres.length > 0 ? genres : [];

  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      {/* Summary pills */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/60 p-5">
          <span className="block font-bold font-redaction text-white text-xl tracking-tight sm:text-2xl">
            {displayGames.length} jogos
          </span>
          <span className="mt-0.5 block text-neutral-400 text-xs">na coleção</span>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/60 p-5">
          <span className="block font-bold font-redaction text-white text-xl tracking-tight sm:text-2xl">
            {displayGames.filter((g) => g.rating).length} avaliações
          </span>
          <span className="mt-0.5 block text-neutral-400 text-xs">avaliações feitas</span>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/60 p-5">
          <span className="block font-bold font-redaction text-white text-xl tracking-tight sm:text-2xl">
            {genreList.length} gêneros
          </span>
          <span className="mt-0.5 block text-neutral-400 text-xs">preferidos</span>
        </div>
      </div>

      {/* Most played (from actual liked games) */}
      {displayGames.length > 0 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-redaction text-base text-white tracking-tight sm:text-lg">
              Jogos na coleção
            </h3>
            <Gamepad2 className="size-4 text-neutral-400" />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {displayGames.slice(0, 6).map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-md transition-[border-color] duration-150 hover:border-white/30"
              >
                <img
                  src={game.coverUrl}
                  alt={game.title}
                  className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Genre preferences */}
      {genreList.length > 0 && (
        <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-redaction text-base text-white tracking-tight sm:text-lg">
              Gêneros favoritos
            </h3>
            <BarChart2 className="size-4 text-neutral-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {genreList.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-neutral-300"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
