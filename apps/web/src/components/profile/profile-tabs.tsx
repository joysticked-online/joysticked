'use client';

import { Activity, BarChart3, BookOpen, ListFilter, Star } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';
import type { Tab } from './types';

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'activity', label: 'Atividade', icon: Activity },
  { id: 'collection', label: 'Coleção', icon: BookOpen },
  { id: 'lists', label: 'Listas', icon: ListFilter },
  { id: 'reviews', label: 'Avaliações', icon: Star },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 }
];

type ProfileTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-white/[0.04] pb-3">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 active:scale-[0.96]',
              isActive
                ? 'text-black font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="liquidActiveTabPill"
                className="absolute inset-0 rounded-lg bg-white"
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 32
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="size-3.5" strokeWidth={isActive ? 2 : 1.5} />
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
