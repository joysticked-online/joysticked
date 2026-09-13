/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { BarChart2, Star } from 'lucide-react';
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
  profile: _profile,
  isOwnProfile: _isOwnProfile = true
}: StatsTabProps) {
  const hasData = displayGames.length > 0;

  if (!hasData) {
    return (
      <motion.div
        key="stats-empty"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center gap-4 rounded-2xl bg-white/[0.02] p-12 text-center ring-1 ring-white/[0.05]"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08]">
          <BarChart2 className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-white">Nenhuma estatística disponível</p>
          <p className="max-w-xs text-xs text-zinc-400 [text-wrap:pretty]">
            As métricas e gráficos serão calculados automaticamente conforme você joga e avalia
            títulos.
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

  // Genre distribution derived from actual user preferences
  const genreList = genres.length > 0 ? genres : [];
  const ratedGames = displayGames.filter((g) => g.rating);
  const avgRating =
    ratedGames.length > 0
      ? (ratedGames.reduce((acc, g) => acc + (g.rating || 0), 0) / ratedGames.length).toFixed(1)
      : '—';

  // Rating breakdown 1 to 5 stars
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const g of ratedGames) {
    const star = Math.min(5, Math.max(1, Math.round(g.rating || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  }

  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className="space-y-5"
    >
      {/* 3 Summary metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/[0.02] p-4 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.05]">
          <span className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Total de Jogos
          </span>
          <span className="mt-0.5 block font-medium font-redaction text-2xl text-white tabular-nums tracking-tight">
            {displayGames.length}
          </span>
          <span className="mt-0.5 block text-[11px] text-zinc-400">no catálogo pessoal</span>
        </div>

        <div className="rounded-2xl bg-white/[0.02] p-4 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.05]">
          <span className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Média de Notas
          </span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-medium font-redaction text-2xl text-white tabular-nums tracking-tight">
              {avgRating}
            </span>
            <span className="font-mono text-xs text-zinc-500">/ 5.0</span>
          </div>
          <span className="mt-0.5 block text-[11px] text-zinc-400">
            {ratedGames.length} avaliações feitas
          </span>
        </div>

        <div className="rounded-2xl bg-white/[0.02] p-4 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.05]">
          <span className="block font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Gêneros Favoritos
          </span>
          <span className="mt-0.5 block font-medium font-redaction text-2xl text-white tabular-nums tracking-tight">
            {genreList.length}
          </span>
          <span className="mt-0.5 block text-[11px] text-zinc-400">estilos selecionados</span>
        </div>
      </div>

      {/* Rating distribution histogram */}
      {ratedGames.length > 0 && (
        <div className="space-y-3 rounded-2xl bg-white/[0.02] p-5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.05]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-sans text-lg text-white tracking-tight">
              Distribuição de Notas
            </h3>
            <Star className="size-4 text-zinc-500" />
          </div>

          <div className="space-y-2 pt-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const pct = ratedGames.length > 0 ? (count / ratedGames.length) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="flex w-12 items-center gap-1 font-mono text-[11px] text-zinc-400">
                    <span>{star}</span>
                    <Star className="size-3 fill-current text-white/60" />
                  </span>

                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-8 text-right font-mono text-[11px] text-zinc-500 tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Genre tags */}
      {genreList.length > 0 && (
        <div className="space-y-3 rounded-2xl bg-white/[0.02] p-5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.05]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-sans text-lg text-white tracking-tight">
              Gêneros em Destaque
            </h3>
            <BarChart2 className="size-4 text-zinc-500" />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {genreList.map((genre) => (
              <span
                key={genre}
                className="rounded-lg bg-white/[0.04] px-3 py-1 font-medium text-xs text-zinc-300 ring-1 ring-white/[0.06]"
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
