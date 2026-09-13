'use client';

import { Award, Gamepad2, Gift, Layers, Shield, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export type StoreType = 'steam' | 'ps5' | 'xbox' | 'epic';

export interface StoreRewardItem {
  title: string;
  desc: string;
  iconType: 'trophy' | 'shield' | 'sparkles' | 'layers' | 'award' | 'target' | 'zap' | 'gift';
}

export const STORE_CONFIGS: Record<
  StoreType,
  {
    name: string;
    pointsLabel: string;
    pointsValue: string;
    icon: typeof Gamepad2;
    rewards: StoreRewardItem[];
  }
> = {
  steam: {
    name: 'Steam',
    icon: Gamepad2,
    pointsLabel: 'XP Steam & Insígnias',
    pointsValue: '+500 XP • Nível 5',
    rewards: [
      {
        title: 'Cartas Colecionáveis',
        desc: '5 Cartas Steam disponíveis para troca',
        iconType: 'layers'
      },
      {
        title: 'Insígnia Exclusiva',
        desc: 'Insígnia de mestre para o perfil Steam',
        iconType: 'shield'
      },
      {
        title: 'Emotes & Planos de Fundo',
        desc: '3 Emoticons raros e 2 Wallpapers de perfil',
        iconType: 'sparkles'
      }
    ]
  },
  ps5: {
    name: 'PlayStation',
    icon: Trophy,
    pointsLabel: 'Pontos PS Stars & Troféus',
    pointsValue: '1,350 Pontos • 1 Platina',
    rewards: [
      {
        title: 'Troféu de Platina',
        desc: 'Desbloqueie o troféu máximo para o seu perfil PSN',
        iconType: 'trophy'
      },
      {
        title: 'Pontos PlayStation Stars',
        desc: 'Ganhe pontos trocáveis por jogos e créditos na PS Store',
        iconType: 'award'
      },
      {
        title: 'Colecionável Digital 3D',
        desc: 'Item comemorativo para sua vitrine virtual PSN',
        iconType: 'shield'
      }
    ]
  },
  xbox: {
    name: 'Xbox',
    icon: Target,
    pointsLabel: 'Gamerscore (G)',
    pointsValue: '1,000 G • Conquistas',
    rewards: [
      {
        title: '1,000 Gamerscore',
        desc: 'Aumente o nível do seu perfil Xbox Live com 1,000G',
        iconType: 'target'
      },
      {
        title: 'Microsoft Rewards',
        desc: 'Pontos conversíveis em saldo na loja Xbox e Game Pass',
        iconType: 'award'
      },
      {
        title: 'Fundo Dinâmico Xbox',
        desc: 'Tema dinâmico exclusivo para a dashboard do console',
        iconType: 'sparkles'
      }
    ]
  },
  epic: {
    name: 'Epic Games',
    icon: Zap,
    pointsLabel: 'XP Epic Games',
    pointsValue: '1,000 XP • Platina',
    rewards: [
      {
        title: '1,000 XP de Conquista',
        desc: 'Suba o nível da sua conta Epic Games',
        iconType: 'zap'
      },
      {
        title: 'Conquista Platina Epic',
        desc: 'Selo de maestria no launcher Epic Games',
        iconType: 'award'
      },
      {
        title: 'Recompensas de Fidelidade',
        desc: 'Pontos de cashback aplicáveis em futuras compras',
        iconType: 'gift'
      }
    ]
  }
};

function renderRewardIcon(type: StoreRewardItem['iconType']) {
  switch (type) {
    case 'trophy':
      return <Trophy className="size-4 text-cyan-300" />;
    case 'shield':
      return <Shield className="size-4 text-indigo-300" />;
    case 'sparkles':
      return <Sparkles className="size-4 text-amber-300" />;
    case 'layers':
      return <Layers className="size-4 text-emerald-300" />;
    case 'award':
      return <Award className="size-4 text-amber-400" />;
    case 'target':
      return <Target className="size-4 text-green-400" />;
    case 'zap':
      return <Zap className="size-4 text-yellow-400" />;
    default:
      return <Gift className="size-4 text-purple-300" />;
  }
}

export function getAvailableStoresForGame(platforms?: string[]): StoreType[] {
  if (!platforms || platforms.length === 0) {
    return ['steam', 'ps5', 'xbox', 'epic'];
  }

  const stores: StoreType[] = [];
  const joined = platforms.join(' ').toLowerCase();

  const isPC =
    joined.includes('pc') ||
    joined.includes('windows') ||
    joined.includes('mac') ||
    joined.includes('linux') ||
    joined.includes('steam');

  const isPlayStation =
    joined.includes('playstation') ||
    joined.includes('ps4') ||
    joined.includes('ps5') ||
    joined.includes('ps3') ||
    joined.includes('vita');

  const isXbox =
    joined.includes('xbox') ||
    joined.includes('series') ||
    joined.includes('one') ||
    joined.includes('360');

  if (isPlayStation) stores.push('ps5');
  if (isXbox) stores.push('xbox');
  if (isPC) {
    stores.push('steam');
    stores.push('epic');
  }

  return stores.length > 0 ? stores : ['steam', 'ps5'];
}

interface GameStoreRewardsProps {
  platforms?: string[];
  selectedStore: StoreType;
  onSelectStore: (store: StoreType) => void;
  unlockedCount: number;
  totalCount: number;
  progressPercent: number;
}

export function GameStoreRewards({
  platforms,
  selectedStore,
  onSelectStore,
  unlockedCount,
  totalCount,
  progressPercent
}: GameStoreRewardsProps) {
  const availableStores = getAvailableStoresForGame(platforms);

  // If current selection is not available for this game, fallback to first available
  const activeStoreKey = availableStores.includes(selectedStore)
    ? selectedStore
    : availableStores[0] || 'steam';

  const currentStore = STORE_CONFIGS[activeStoreKey];

  return (
    <div className="space-y-5 rounded-3xl border border-white/10 bg-neutral-900/60 p-5 shadow-xl backdrop-blur-xl sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-base text-white">
            <Gift className="size-4.5 text-white" />
            <span>Recompensas por Plataforma</span>
          </h3>
          <p className="text-neutral-400 text-xs">
            Pontuações e recompensas exclusivas das lojas digitais suportadas.
          </p>
        </div>

        {/* Store Switcher Pills with Lucide Icons and NO emojis */}
        {availableStores.length > 1 && (
          <div className="relative flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {availableStores.map((s) => {
              const cfg = STORE_CONFIGS[s];
              const Icon = cfg.icon;
              const isActive = activeStoreKey === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSelectStore(s)}
                  className={`relative flex cursor-pointer select-none items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-xs transition-colors ${
                    isActive ? 'font-semibold text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="store-reward-liquid-pill"
                      className="absolute inset-0 rounded-xl bg-white shadow-sm"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 30
                      }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 size-3.5 ${isActive ? 'text-black' : 'text-neutral-400'}`}
                  />
                  <span className="relative z-10">{cfg.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Store Rewards Cards Grid without emojis */}
      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
        {currentStore.rewards.map((rew) => (
          <div
            key={rew.title}
            className="space-y-1.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition-colors hover:border-white/20"
          >
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                {renderRewardIcon(rew.iconType)}
              </div>
              <span className="line-clamp-1 font-bold text-white text-xs">{rew.title}</span>
            </div>
            <p className="pl-9 text-[11px] text-neutral-400 leading-relaxed">{rew.desc}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar & Value Badge */}
      <div className="space-y-2 border-white/10 border-t pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 font-semibold text-neutral-300">
            <Trophy className="size-3.5 text-white" />
            <span>
              Progresso de Conquistas: {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </span>
          <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-0.5 font-bold text-white">
            {currentStore.pointsValue}
          </span>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
          />
        </div>
      </div>
    </div>
  );
}
