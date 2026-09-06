'use client';

import { Trophy, Zap } from 'lucide-react';
import { motion } from 'motion/react';

type StatsTabProps = {
  genres: string[];
};

export function StatsTab({ genres }: StatsTabProps) {
  const displayGenres = genres.length > 0 ? genres : ['Action RPG', 'Souls-like', 'Metroidvania'];

  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="rounded-2xl bg-neutral-900/30 p-6 space-y-4">
        <h3 className="font-semibold text-sm text-white">Gêneros Mais Jogados</h3>
        <div className="space-y-3">
          {displayGenres.map((g, idx) => (
            <div key={g}>
              <div className="mb-1 flex justify-between text-neutral-400 text-xs">
                <span>{g}</span>
                <span className="font-medium text-neutral-300">{85 - idx * 20}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-900">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${85 - idx * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900/30 p-6 space-y-4">
        <h3 className="font-semibold text-sm text-white">Estatísticas Gerais</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-neutral-900/60 p-3.5 text-center">
            <span className="block font-bold text-xl text-white">433h</span>
            <span className="text-[10px] text-neutral-400">Tempo Total</span>
          </div>
          <div className="rounded-xl bg-neutral-900/60 p-3.5 text-center">
            <span className="block font-bold text-xl text-amber-400">4.9</span>
            <span className="text-[10px] text-neutral-400">Média de Notas</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-medium text-purple-300">
            <Trophy className="size-3 text-purple-400" />
            Caçador de Platinas
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-medium text-blue-300">
            <Zap className="size-3 text-blue-400" />
            Explorador de RPGs
          </span>
        </div>
      </div>
    </motion.div>
  );
}
