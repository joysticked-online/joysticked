/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { List, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { ProfileGame } from '../types';

type ListsTabProps = {
  displayGames: ProfileGame[];
};

export function ListsTab({ displayGames }: ListsTabProps) {
  if (!displayGames || displayGames.length < 4) {
    return (
      <motion.div
        key="lists-empty"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center gap-4 rounded-2xl bg-white/[0.02] p-12 text-center ring-1 ring-white/[0.05]"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08]">
          <List className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-white">Nenhuma lista personalizada ainda</p>
          <p className="max-w-xs text-xs text-zinc-400 [text-wrap:pretty]">
            Crie listas temáticas para catalogar franquias, platinas ou recomendações.
          </p>
        </div>
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-medium text-xs text-black transition-all hover:bg-zinc-200 active:scale-[0.96]"
        >
          <Plus className="size-3.5" />
          <span>Criar primeira lista</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="lists"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="space-y-3 rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all hover:bg-white/[0.04] hover:ring-white/[0.08]">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/[0.06]">
            {displayGames.slice(0, 6).length} jogos
          </span>
          <span className="font-mono text-[11px] text-zinc-500">atualizado recente</span>
        </div>
        <div>
          <h3 className="font-sans text-lg font-bold text-white tracking-tight">Favoritos de Sempre</h3>
          <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed [text-wrap:pretty]">
            Os títulos mais marcantes da sua jornada nos games.
          </p>
        </div>
        <div className="-space-x-2.5 flex pt-2">
          {displayGames.slice(0, 5).map((g) => (
            <img
              key={g.id}
              src={g.coverUrl}
              alt={g.title}
              className="size-11 rounded-xl object-cover ring-2 ring-[#08080a] shadow-md"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
