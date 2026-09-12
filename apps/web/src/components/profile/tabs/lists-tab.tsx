'use client';

import { List, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import type { ProfileGame } from '../types';

type ListsTabProps = {
  displayGames: ProfileGame[];
};

export function ListsTab({ displayGames }: ListsTabProps) {
  // Only render real lists if there's actual game data to populate them
  if (!displayGames || displayGames.length < 4) {
    return (
      <motion.div
        key="lists-empty"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-neutral-600">
          <List className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-neutral-300">Nenhuma lista ainda</p>
          <p className="max-w-xs text-[12px] text-neutral-500 leading-relaxed">
            Crie listas para organizar seus jogos favoritos, platinados ou que pretende jogar.
          </p>
        </div>
        <button
          type="button"
          className="mt-1 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          <Plus className="size-3" />
          Criar lista
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="lists"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div className="space-y-3 rounded-2xl bg-neutral-900/30 p-5 transition-colors hover:bg-neutral-900/60">
        <div className="flex items-center justify-between">
          <span className="rounded bg-white/[0.05] px-2 py-0.5 font-medium text-[10px] text-neutral-400">
            {displayGames.slice(0, 6).length} jogos
          </span>
          <span className="text-[11px] text-neutral-500">Atualizado recentemente</span>
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Favoritos</h3>
          <p className="mt-1 text-neutral-400 text-xs leading-relaxed">
            Jogos que você mais curtiu e quer lembrar sempre.
          </p>
        </div>
        <div className="-space-x-2 flex pt-2">
          {displayGames.slice(0, 4).map((g) => (
            <img
              key={g.id}
              src={g.coverUrl}
              alt={g.title}
              className="size-10 rounded-lg object-cover ring-2 ring-[#070709]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
