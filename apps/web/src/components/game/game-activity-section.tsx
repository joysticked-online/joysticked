'use client';

import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  Sparkles,
  Gamepad2
} from 'lucide-react';
import type { GameActivity, Game } from '@/lib/games';

interface GameActivitySectionProps {
  game: Game;
  activities: GameActivity[];
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'played':
      return <CheckCircle2 className="size-3.5 text-white" />;
    case 'playing':
      return <Clock className="size-3.5 text-neutral-400" />;
    case 'liked':
    case 'favorited':
      return <Heart className="size-3.5 text-white fill-white" />;
    case 'rated':
    case 'reviewed':
      return <MessageSquare className="size-3.5 text-neutral-300" />;
    default:
      return <Sparkles className="size-3.5 text-neutral-400" />;
  }
}

export function GameActivitySection({ game, activities }: GameActivitySectionProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-10 text-center">
        <Activity className="size-8 mx-auto text-neutral-600 mb-2" />
        <p className="text-sm font-medium text-neutral-300">Nenhuma atividade recente</p>
        <p className="text-xs text-neutral-500 mt-1">
          As ações dos jogadores aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {activities.map((act) => (
        <div
          key={act.id}
          className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-white/15"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-full bg-white/[0.05] border border-white/10">
              {getActivityIcon(act.type)}
            </div>

            <div className="text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/${act.user?.username || ''}`}
                  className="font-semibold text-white hover:underline"
                >
                  @{act.user?.username || 'jogador'}
                </Link>
                <span className="text-neutral-400">
                  {act.detail || 'interagiu com o jogo'}
                </span>
              </div>

              {act.platform && (
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                  <Gamepad2 className="size-3" />
                  <span>{act.platform}</span>
                </div>
              )}
            </div>
          </div>

          <span className="text-[10px] text-neutral-500 flex-shrink-0">
            {new Date(act.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short'
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
