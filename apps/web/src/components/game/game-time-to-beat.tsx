'use client';

import { Clock } from 'lucide-react';
import type { Game } from '@/lib/games';

interface GameTimeToBeatProps {
  game: Game;
}

export function GameTimeToBeat({ game }: GameTimeToBeatProps) {
  const isElden = game.slug.includes('elden-ring');
  const timeToBeat = isElden
    ? {
        main: '58h',
        mainExtra: '102h',
        completionist: '134h',
        allStyles: '86h'
      }
    : {
        main: '25h',
        mainExtra: '45h',
        completionist: '70h',
        allStyles: '40h'
      };

  return (
    <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-neutral-400 text-xs uppercase tracking-wider">
          <Clock className="size-3.5 text-white" />
          <span>Tempo de Jogo Estimado (Time to Beat)</span>
        </h3>
        <span className="text-[10px] text-neutral-500">Média de jogadores</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Main Story */}
        <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
          <span className="block font-medium text-[11px] text-neutral-400">História Principal</span>
          <div className="flex items-baseline gap-1 font-bold text-lg text-white sm:text-xl">
            <span>{timeToBeat.main}</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[45%] rounded-full bg-white" />
          </div>
        </div>

        {/* Main + Extra */}
        <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
          <span className="block font-medium text-[11px] text-neutral-400">História + Extras</span>
          <div className="flex items-baseline gap-1 font-bold text-lg text-white sm:text-xl">
            <span>{timeToBeat.mainExtra}</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[75%] rounded-full bg-white" />
          </div>
        </div>

        {/* Completionist */}
        <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
          <span className="block font-medium text-[11px] text-neutral-400">100% Completista</span>
          <div className="flex items-baseline gap-1 font-bold text-lg text-white sm:text-xl">
            <span>{timeToBeat.completionist}</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-full rounded-full bg-white" />
          </div>
        </div>

        {/* All Styles */}
        <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
          <span className="block font-medium text-[11px] text-neutral-400">Média Geral</span>
          <div className="flex items-baseline gap-1 font-bold text-lg text-white sm:text-xl">
            <span>{timeToBeat.allStyles}</span>
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[65%] rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
