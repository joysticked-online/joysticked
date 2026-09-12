'use client';

import { BookmarkPlus, Gamepad2, Heart, ListPlus, Star, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

import type { ProfileGame } from '../types';
import type { GameReview } from '@/lib/games';

type ActivityTabProps = {
  displayGames: ProfileGame[];
  displayName: string;
  localReviews?: GameReview[];
};

type ActivityItem = {
  id: string;
  type: 'played' | 'liked' | 'added_list' | 'rated' | 'completed' | 'backlog';
  gameTitle: string;
  detail?: string;
  timeAgo: string;
  platform?: string;
};

const EVENT_CONFIG = {
  played: { icon: Gamepad2, actionText: 'jogou' },
  rated: { icon: Star, actionText: 'avaliou' },
  liked: { icon: Heart, actionText: 'curtiu' },
  added_list: { icon: ListPlus, actionText: 'adicionou à lista' },
  completed: { icon: Trophy, actionText: 'concluiu' },
  backlog: { icon: BookmarkPlus, actionText: 'planeja jogar' }
};

function timeAgoLabel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins || 1} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'ontem';
  if (days < 30) return `há ${days} dias`;
  return `há ${Math.floor(days / 30)} mês${Math.floor(days / 30) > 1 ? 'es' : ''}`;
}

export function ActivityTab({ displayGames, displayName, localReviews = [] }: ActivityTabProps) {
  // Build activity from real localStorage reviews first
  const reviewActivities: ActivityItem[] = localReviews.map((r) => ({
    id: `act-rev-${r.id}`,
    type: 'rated' as const,
    gameTitle: r.gameTitle,
    detail: `Avaliou com ${r.rating.toFixed(1)} estrelas${r.reviewText ? ' · com crítica' : ''}`,
    timeAgo: timeAgoLabel(r.createdAt),
    platform: r.platform ?? undefined
  }));

  // Fill remaining slots with liked games (no review = just "liked")
  const reviewedSlugs = new Set(localReviews.map((r) => r.gameSlug));
  const likedActivities: ActivityItem[] = displayGames
    .filter((g) => !reviewedSlugs.has(g.id))
    .slice(0, Math.max(0, 6 - reviewActivities.length))
    .map((g) => ({
      id: `act-liked-${g.id}`,
      type: 'liked' as const,
      gameTitle: g.title,
      detail: 'Adicionado à coleção',
      timeAgo: '—',
      platform: g.platformTag
    }));

  const activities: ActivityItem[] = [...reviewActivities, ...likedActivities].slice(0, 6);

  if (activities.length === 0) {
    return (
      <motion.div
        key="activity-empty"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] text-neutral-600">
          <Gamepad2 className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-neutral-300">Nenhuma atividade ainda</p>
          <p className="max-w-xs text-[12px] text-neutral-500 leading-relaxed">
            Comece avaliando e registrando os jogos que você já jogou.
          </p>
        </div>
        <Link
          href="/games"
          className="mt-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white"
        >
          Explorar jogos
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="divide-y divide-white/[0.04]"
    >
      {activities.map((act) => {
        const config = EVENT_CONFIG[act.type] || EVENT_CONFIG.played;
        const Icon = config.icon;

        return (
          <div
            key={act.id}
            className="group flex items-center justify-between py-3.5 transition-colors hover:bg-white/[0.01]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-neutral-400">
                <Icon className="size-3.5" strokeWidth={1.5} />
              </div>

              <div className="space-y-0.5 text-xs">
                <p className="text-neutral-300">
                  <span className="font-semibold text-white">{displayName}</span>{' '}
                  <span className="text-neutral-400">{config.actionText}</span>{' '}
                  <span className="font-medium text-white transition-colors group-hover:text-neutral-200">
                    {act.gameTitle}
                  </span>
                </p>
                {act.detail && <p className="text-[11px] text-neutral-500">{act.detail}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] text-neutral-500 shrink-0">
              {act.platform && (
                <span className="hidden rounded bg-white/[0.03] px-2 py-0.5 text-[10px] text-neutral-400 sm:inline-block">
                  {act.platform}
                </span>
              )}
              <span>{act.timeAgo}</span>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
