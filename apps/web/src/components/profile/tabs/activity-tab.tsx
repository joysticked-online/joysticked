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
  gameSlug?: string;
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
    gameSlug: r.gameSlug,
    gameTitle: r.gameTitle,
    detail: `Avaliou com ${r.rating.toFixed(1)} estrelas${r.reviewText ? ' · com crítica' : ''}`,
    timeAgo: timeAgoLabel(r.createdAt),
    platform: r.platform ?? undefined
  }));

  // Fill remaining slots with liked games (no review = just "liked")
  const reviewedSlugs = new Set(localReviews.map((r) => r.gameSlug));
  const likedActivities: ActivityItem[] = displayGames
    .filter((g) => !reviewedSlugs.has(g.id))
    .slice(0, Math.max(0, 8 - reviewActivities.length))
    .map((g) => ({
      id: `act-liked-${g.id}`,
      type: 'liked' as const,
      gameSlug: g.id,
      gameTitle: g.title,
      detail: 'Adicionado à coleção',
      timeAgo: 'recente',
      platform: g.platformTag
    }));

  const activities: ActivityItem[] = [...reviewActivities, ...likedActivities].slice(0, 8);

  if (activities.length === 0) {
    return (
      <motion.div
        key="activity-empty"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-center gap-4 rounded-2xl bg-white/[0.02] p-12 text-center ring-1 ring-white/[0.05]"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08]">
          <Gamepad2 className="size-5" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm text-white">Nenhuma atividade registrada</p>
          <p className="max-w-xs text-xs text-zinc-400 [text-wrap:pretty]">
            Avalie ou adicione jogos à sua coleção para preencher o diário de bordo.
          </p>
        </div>
        <Link
          href="/games"
          className="mt-1 rounded-xl bg-white px-4 py-2 text-xs font-medium text-black transition-all hover:bg-zinc-200 active:scale-[0.96]"
        >
          Explorar catálogo
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="activity-list"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      className="space-y-2"
    >
      {activities.map((act) => {
        const config = EVENT_CONFIG[act.type] || EVENT_CONFIG.played;
        const Icon = config.icon;

        return (
          <div
            key={act.id}
            className="group flex items-center justify-between rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04] transition-all hover:bg-white/[0.04] hover:ring-white/[0.08]"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-300 ring-1 ring-white/[0.06]">
                <Icon className="size-4" strokeWidth={1.5} />
              </div>

              <div className="space-y-0.5 text-xs text-left">
                <p className="text-zinc-300">
                  <span className="font-semibold text-white">{displayName}</span>{' '}
                  <span className="text-zinc-400">{config.actionText}</span>{' '}
                  {act.gameSlug ? (
                    <Link
                      href={`/games/${act.gameSlug}`}
                      className="font-medium text-white hover:underline transition-colors"
                    >
                      {act.gameTitle}
                    </Link>
                  ) : (
                    <span className="font-medium text-white">{act.gameTitle}</span>
                  )}
                </p>
                {act.detail && <p className="text-[11px] text-zinc-500">{act.detail}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {act.platform && (
                <span className="hidden rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/[0.06] sm:inline-block">
                  {act.platform}
                </span>
              )}
              <span className="font-mono text-[11px] text-zinc-500 tabular-nums">{act.timeAgo}</span>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
