'use client';

import { motion } from 'motion/react';

import type { ProfileGame } from '../types';

type ListsTabProps = {
  displayGames: ProfileGame[];
};

export function ListsTab({ displayGames }: ListsTabProps) {
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
            6 jogos
          </span>
          <span className="text-[11px] text-neutral-500">Atualizado recentemente</span>
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Obras-Primas Absolutas</h3>
          <p className="mt-1 text-neutral-400 text-xs leading-relaxed">
            Jogos que marcaram época pela direção de arte, narrativa e gameplay inesquecível.
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

      <div className="space-y-3 rounded-2xl bg-neutral-900/30 p-5 transition-colors hover:bg-neutral-900/60">
        <div className="flex items-center justify-between">
          <span className="rounded bg-white/[0.05] px-2 py-0.5 font-medium text-[10px] text-neutral-400">
            4 jogos
          </span>
          <span className="text-[11px] text-neutral-500">há 1 semana</span>
        </div>
        <div>
          <h3 className="font-bold text-base text-white">Jornada Soulsborne</h3>
          <p className="mt-1 text-neutral-400 text-xs leading-relaxed">
            Do primeiro contato com Lordran até as Terras Intermédias de Elden Ring.
          </p>
        </div>
        <div className="-space-x-2 flex pt-2">
          {displayGames.slice(0, 3).map((g) => (
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
