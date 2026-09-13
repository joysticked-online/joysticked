/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { Check, Lock, Trophy } from 'lucide-react';
import type { Achievement } from './game-achievements-tab';

interface GameAchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

export function GameAchievementCard({ achievement, isUnlocked }: GameAchievementCardProps) {
  const formattedDate = achievement.unlockTime
    ? new Date(achievement.unlockTime * 1000).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-3.5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${
        isUnlocked ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.015]'
      }`}
    >
      {/* Left Trophy / Icon Info */}
      <div className="flex min-w-0 items-start gap-3 pr-1 sm:items-center sm:gap-3.5 sm:pr-3">
        {achievement.icon ? (
          <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
            <img
              src={isUnlocked ? achievement.icon : achievement.iconGray || achievement.icon}
              alt={achievement.name}
              className={`h-full w-full object-cover ${isUnlocked ? '' : 'opacity-40 grayscale'}`}
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${
              achievement.tier === 'platinum'
                ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                : achievement.tier === 'gold'
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : achievement.tier === 'silver'
                    ? 'border-neutral-400/30 bg-neutral-400/10 text-neutral-300'
                    : 'border-amber-700/30 bg-amber-700/10 text-amber-500'
            } ${isUnlocked ? '' : 'opacity-40 grayscale'}`}
          >
            <Trophy className="size-5" />
          </div>
        )}

        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`font-semibold text-xs sm:truncate sm:text-sm ${
                isUnlocked ? 'text-white' : 'text-neutral-300'
              }`}
            >
              {achievement.name}
            </h4>
            <span className="whitespace-nowrap text-[10px] text-neutral-500">
              • {achievement.rarity}% dos jogadores
            </span>
          </div>
          <p className="line-clamp-2 text-neutral-400 text-xs leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>

      {/* Right Verified Completion Status Badge (Strictly read-only) */}
      <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end sm:gap-1">
        {isUnlocked ? (
          <>
            <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-semibold text-[11px] text-emerald-400">
              <Check className="size-3 text-emerald-400" />
              <span>Conquistada</span>
            </span>
            {formattedDate && (
              <span className="font-normal text-[10px] text-neutral-500">{formattedDate}</span>
            )}
          </>
        ) : (
          <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 font-medium text-[11px] text-neutral-500">
            <Lock className="size-3 text-neutral-600" />
            <span>Bloqueada</span>
          </span>
        )}
      </div>
    </div>
  );
}
