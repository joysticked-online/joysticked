'use client';

import { BookmarkPlus, Gamepad2, Heart, ListPlus, Star, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

import type { ProfileGame } from '../types';

type ActivityTabProps = {
  displayGames: ProfileGame[];
  displayName: string;
};

type ActivityItem = {
  id: string;
  type: 'played' | 'liked' | 'added_list' | 'rated' | 'completed' | 'backlog';
  gameTitle: string;
  detail?: string;
  timeAgo: string;
  platform?: string;
};

export function ActivityTab({ displayGames, displayName }: ActivityTabProps) {
  const activities: ActivityItem[] =
    displayGames && displayGames.length > 0
      ? displayGames.slice(0, 6).map((g, idx) => ({
          id: `act-${g.id}`,
          type: (idx % 4 === 0
            ? 'played'
            : idx % 4 === 1
              ? 'rated'
              : idx % 4 === 2
                ? 'completed'
                : 'liked') as ActivityItem['type'],
          gameTitle: g.title,
          detail: g.rating
            ? `Avaliou com ${g.rating.toFixed(1)} estrelas`
            : g.hours
              ? `${g.hours}h registradas`
              : 'Adicionado à coleção',
          timeAgo: idx === 0 ? 'há 2 horas' : idx === 1 ? 'ontem' : `há ${idx + 1} dias`,
          platform: g.platformTag || 'PC / Consoles'
        }))
      : [
          {
            id: 'act-1',
            type: 'played',
            gameTitle: 'Elden Ring',
            detail: '142h registradas • Platinado',
            timeAgo: 'há 2 horas',
            platform: 'PC / Steam'
          },
          {
            id: 'act-2',
            type: 'rated',
            gameTitle: "Baldur's Gate 3",
            detail: 'Avaliou com 5.0 estrelas',
            timeAgo: 'ontem',
            platform: 'PC / Steam'
          },
          {
            id: 'act-3',
            type: 'liked',
            gameTitle: 'Cyberpunk 2077',
            detail: 'Curtiu o jogo',
            timeAgo: 'há 2 dias',
            platform: 'PS5'
          },
          {
            id: 'act-4',
            type: 'added_list',
            gameTitle: 'Hollow Knight',
            detail: 'Adicionou à lista "Obras-Primas Absolutas"',
            timeAgo: 'há 4 dias',
            platform: 'Steam Deck'
          },
          {
            id: 'act-5',
            type: 'completed',
            gameTitle: 'God of War Ragnarök',
            detail: 'História principal concluída • 48h',
            timeAgo: 'há 1 semana',
            platform: 'PS5'
          },
          {
            id: 'act-6',
            type: 'backlog',
            gameTitle: 'The Legend of Zelda: Tears of the Kingdom',
            detail: 'Adicionou à fila de espera',
            timeAgo: 'há 2 semanas',
            platform: 'Switch'
          }
        ];

  const EVENT_CONFIG = {
    played: {
      icon: Gamepad2,
      actionText: 'jogou'
    },
    rated: {
      icon: Star,
      actionText: 'avaliou'
    },
    liked: {
      icon: Heart,
      actionText: 'curtiu'
    },
    added_list: {
      icon: ListPlus,
      actionText: 'adicionou à lista'
    },
    completed: {
      icon: Trophy,
      actionText: 'concluiu'
    },
    backlog: {
      icon: BookmarkPlus,
      actionText: 'planeja jogar'
    }
  };

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
            {/* Left: Neutral Icon + User Name + Action + Game */}
            <div className="flex items-center gap-3">
              <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-neutral-400">
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

            {/* Right: Platform + Time */}
            <div className="flex items-center gap-2.5 text-[11px] text-neutral-500">
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
