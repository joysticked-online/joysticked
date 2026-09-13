'use client';

import {
  Activity,
  CheckCircle2,
  Clock,
  Gamepad2,
  Heart,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import type { GameActivity } from '@/lib/games';

interface GameActivitySectionProps {
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
      return <Heart className="size-3.5 fill-white text-white" />;
    case 'rated':
    case 'reviewed':
      return <MessageSquare className="size-3.5 text-neutral-300" />;
    default:
      return <Sparkles className="size-3.5 text-neutral-400" />;
  }
}

export function GameActivitySection({ activities }: GameActivitySectionProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-10 text-center">
        <Activity className="mx-auto mb-2 size-8 text-neutral-600" />
        <p className="font-medium text-neutral-300 text-sm">Nenhuma atividade recente</p>
        <p className="mt-1 text-neutral-500 text-xs">As ações dos jogadores aparecerão aqui.</p>
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
            <div className="flex size-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
              {getActivityIcon(act.type)}
            </div>

            <div className="text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={`/${act.user?.username || ''}`}
                  className="font-semibold text-white hover:underline"
                >
                  @{act.user?.username || 'jogador'}
                </Link>
                <span className="text-neutral-400">{act.detail || 'interagiu com o jogo'}</span>
              </div>

              {act.platform && (
                <div className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500">
                  <Gamepad2 className="size-3" />
                  <span>{act.platform}</span>
                </div>
              )}
            </div>
          </div>

          <span className="flex-shrink-0 text-[10px] text-neutral-500">
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
