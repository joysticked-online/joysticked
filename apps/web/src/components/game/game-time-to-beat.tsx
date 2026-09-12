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
    <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium text-neutral-400 text-xs uppercase tracking-wider">
          <Clock className="size-3.5 text-neutral-400" />
          <span>Tempo de Jogo Estimado (Time to Beat)</span>
        </h3>
        <span className="font-mono text-[10px] text-neutral-500">HLTB Data</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Main Story */}
        <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-colors hover:border-white/15">
          <span className="block font-medium text-[11px] text-neutral-400 tracking-tight">História Principal</span>
          <div className="flex items-baseline gap-1 font-mono font-bold text-xl text-white sm:text-2xl">
            <span>{timeToBeat.main}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[45%] rounded-full bg-white transition-all duration-500" />
          </div>
        </div>

        {/* Main + Extra */}
        <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-colors hover:border-white/15">
          <span className="block font-medium text-[11px] text-neutral-400 tracking-tight">História + Extras</span>
          <div className="flex items-baseline gap-1 font-mono font-bold text-xl text-white sm:text-2xl">
            <span>{timeToBeat.mainExtra}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[75%] rounded-full bg-white transition-all duration-500" />
          </div>
        </div>

        {/* Completionist */}
        <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-colors hover:border-white/15">
          <span className="block font-medium text-[11px] text-neutral-400 tracking-tight">100% Completista</span>
          <div className="flex items-baseline gap-1 font-mono font-bold text-xl text-white sm:text-2xl">
            <span>{timeToBeat.completionist}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-full rounded-full bg-white transition-all duration-500" />
          </div>
        </div>

        {/* All Styles */}
        <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 transition-colors hover:border-white/15">
          <span className="block font-medium text-[11px] text-neutral-400 tracking-tight">Média Geral</span>
          <div className="flex items-baseline gap-1 font-mono font-bold text-xl text-white sm:text-2xl">
            <span>{timeToBeat.allStyles}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[65%] rounded-full bg-white transition-all duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
