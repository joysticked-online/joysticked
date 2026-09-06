'use client';

import { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  Search,
  Check,
  Percent
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import type { Game } from '@/lib/games';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: number; // e.g. 9.4 (%)
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  icon?: string;
  unlocked?: boolean;
}

// Sample Curated Achievements Database for Elden Ring & generic fallback generator
const ELDEN_RING_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'er-1',
    name: 'Elden Ring',
    description: 'Obteve todos os troféus e conquistou as Terras Intermédias.',
    rarity: 8.9,
    tier: 'platinum'
  },
  {
    id: 'er-2',
    name: 'Elden Lord',
    description: 'Alcançou o final Elden Lord e restaurou a ordem do Anel Prístino.',
    rarity: 22.4,
    tier: 'gold'
  },
  {
    id: 'er-3',
    name: 'Age of the Stars',
    description: 'Completou a jornada de Ranni, a Bruxa, e inaugurou a Era das Estrelas.',
    rarity: 24.1,
    tier: 'gold'
  },
  {
    id: 'er-4',
    name: 'Lord of the Frenzied Flame',
    description: 'Sucumbiu à Chama Frenética e queimou o mundo até as cinzas.',
    rarity: 13.7,
    tier: 'gold'
  },
  {
    id: 'er-5',
    name: 'Shardbearer Malenia',
    description: 'Derrotou Malenia, a Espada de Miquella no Haligtree.',
    rarity: 19.3,
    tier: 'silver'
  },
  {
    id: 'er-6',
    name: 'Shardbearer Radahn',
    description: 'Derrotou o Flagelo Estelar Radahn no Festival de Redmane.',
    rarity: 48.2,
    tier: 'silver'
  },
  {
    id: 'er-7',
    name: 'Shardbearer Mohg',
    description: 'Derrotou Mohg, o Senhor do Sangue no Palácio de Mohgwyn.',
    rarity: 26.8,
    tier: 'silver'
  },
  {
    id: 'er-8',
    name: 'Shardbearer Rykard',
    description: 'Derrotou Rykard, Senhor da Blasfêmia na Mansão Vulcânica.',
    rarity: 41.5,
    tier: 'silver'
  },
  {
    id: 'er-9',
    name: 'Maliketh the Black Blade',
    description: 'Derrotou Maliketh, a Lâmina Negra em Crumbling Farum Azula.',
    rarity: 33.6,
    tier: 'silver'
  },
  {
    id: 'er-10',
    name: 'Hoarah Loux the Warrior',
    description: 'Derrotou o Primeiro Lorde Prístino, Godfrey, em Leyndell.',
    rarity: 32.1,
    tier: 'silver'
  },
  {
    id: 'er-11',
    name: 'Dragonlord Placidusax',
    description: 'Derrotou o Senhor Dragão Placidusax no coração da tempestade.',
    rarity: 16.5,
    tier: 'silver'
  },
  {
    id: 'er-12',
    name: 'Legendary Armaments',
    description: 'Coletou todas as 9 armas lendárias das Terras Intermédias.',
    rarity: 14.8,
    tier: 'silver'
  },
  {
    id: 'er-13',
    name: 'Legendary Ashen Remains',
    description: 'Adquiriu todas as cinzas espirituais lendárias.',
    rarity: 18.2,
    tier: 'silver'
  },
  {
    id: 'er-14',
    name: 'Legendary Talismans',
    description: 'Coletou todos os 8 talismãs lendários.',
    rarity: 21.0,
    tier: 'silver'
  },
  {
    id: 'er-15',
    name: 'God-Slaying Armament',
    description: 'Aprimorou qualquer arma até o nível máximo de reforço.',
    rarity: 56.4,
    tier: 'bronze'
  },
  {
    id: 'er-16',
    name: 'Margit, the Fell Omen',
    description: 'Derrotou Margit, o Agouro Caído nos portões do Castelo Stormveil.',
    rarity: 74.8,
    tier: 'bronze'
  },
  {
    id: 'er-17',
    name: 'Godrick the Grafted',
    description: 'Derrotou Godrick, o Enxertado e reivindicou sua Grande Runa.',
    rarity: 68.2,
    tier: 'bronze'
  },
  {
    id: 'er-18',
    name: 'Rennala, Queen of the Full Moon',
    description: 'Derrotou a Rainha da Lua Cheia na Academia de Raya Lucaria.',
    rarity: 58.9,
    tier: 'bronze'
  }
];

interface GameAchievementsTabProps {
  game: Game;
}

export function GameAchievementsTab({ game }: GameAchievementsTabProps) {
  const isElden = game.slug.includes('elden-ring');
  const baseAchievements = isElden ? ELDEN_RING_ACHIEVEMENTS : generateDefaultAchievements(game.name);

  const [unlockedIds, setUnlockedIds] = useState<Record<string, boolean>>({});
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleUnlock = (id: string, name: string) => {
    const isNowUnlocked = !unlockedIds[id];
    setUnlockedIds((prev) => ({ ...prev, [id]: isNowUnlocked }));

    if (isNowUnlocked) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 }
      });
      toast.success(`Conquista desbloqueada: "${name}"!`, {
        icon: '🏆'
      });
    }
  };

  const unlockedCount = Object.values(unlockedIds).filter(Boolean).length;
  const progressPercent = Math.round((unlockedCount / baseAchievements.length) * 100);

  const filteredAchievements = baseAchievements.filter((ach) => {
    if (tierFilter !== 'all' && ach.tier !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ach.name.toLowerCase().includes(q) || ach.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Summary Bar */}
      <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-5 sm:p-6 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="size-4.5 text-white" />
              <span>Conquistas & Troféus ({baseAchievements.length})</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Acompanhe seu progresso e marque as conquistas já desbloqueadas.
            </p>
          </div>

          {/* Unlocked Progress Pill */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-white">
                {unlockedCount} de {baseAchievements.length} desbloqueadas
              </div>
              <div className="text-[11px] text-neutral-400">{progressPercent}% concluído</div>
            </div>
            <div className="size-11 rounded-full border border-white/15 bg-white/5 flex items-center justify-center font-black text-xs text-white">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
          />
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tier Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todas', count: baseAchievements.length },
            { id: 'platinum', label: '🏆 Platina', count: baseAchievements.filter(a => a.tier === 'platinum').length },
            { id: 'gold', label: '🥇 Ouro', count: baseAchievements.filter(a => a.tier === 'gold').length },
            { id: 'silver', label: '🥈 Prata', count: baseAchievements.filter(a => a.tier === 'silver').length },
            { id: 'bronze', label: '🥉 Bronze', count: baseAchievements.filter(a => a.tier === 'bronze').length }
          ].filter(t => t.count > 0 || t.id === 'all').map((t) => {
            const isActive = tierFilter === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTierFilter(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'border-white bg-white text-black font-semibold'
                    : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Quick Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar conquistas..."
            className="w-full h-8.5 rounded-xl border border-white/10 bg-black/60 pl-8.5 pr-3 text-xs text-white placeholder:text-neutral-500 focus:border-white/30 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-2.5">
        {filteredAchievements.map((ach) => {
          const isUnlocked = !!unlockedIds[ach.id];
          return (
            <div
              key={ach.id}
              className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                isUnlocked
                  ? 'border-white/20 bg-white/[0.05]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15'
              }`}
            >
              {/* Left Trophy Info */}
              <div className="flex items-center gap-3.5 min-w-0 pr-3">
                {/* Trophy Icon */}
                <div
                  className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    ach.tier === 'platinum'
                      ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                      : ach.tier === 'gold'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : ach.tier === 'silver'
                      ? 'border-neutral-400/30 bg-neutral-400/10 text-neutral-300'
                      : 'border-amber-700/30 bg-amber-700/10 text-amber-500'
                  }`}
                >
                  <Trophy className="size-5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs sm:text-sm font-semibold truncate ${isUnlocked ? 'text-white' : 'text-neutral-200'}`}>
                      {ach.name}
                    </h4>
                    <span className="text-[10px] text-neutral-500">• {ach.rarity}% dos jogadores</span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              {/* Right Toggle Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => toggleUnlock(ach.id, ach.name)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border select-none ${
                  isUnlocked
                    ? 'border-white bg-white text-black font-semibold shadow-sm'
                    : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/25 hover:text-white'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <Check className="size-3 text-black" />
                    <span>Conquistada</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-3 text-neutral-500" />
                    <span>Desbloquear</span>
                  </>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function generateDefaultAchievements(gameName: string): Achievement[] {
  return [
    {
      id: 'gen-1',
      name: `${gameName} - Completista`,
      description: `Desbloqueou todas as conquistas e segredos de ${gameName}.`,
      rarity: 5.4,
      tier: 'platinum'
    },
    {
      id: 'gen-2',
      name: 'Campanha Concluída',
      description: 'Chegou ao final da história principal.',
      rarity: 32.8,
      tier: 'gold'
    },
    {
      id: 'gen-3',
      name: 'Mestre do Combate',
      description: 'Dominou todas as mecânicas avançadas e derrotou chefes opcionais.',
      rarity: 18.2,
      tier: 'silver'
    },
    {
      id: 'gen-4',
      name: 'Colecionador Lendário',
      description: 'Encontrou todos os itens secretos e colecionáveis espalhados pelo mapa.',
      rarity: 14.5,
      tier: 'silver'
    },
    {
      id: 'gen-5',
      name: 'Primeiros Passos',
      description: 'Concluiu o prólogo e iniciou a grande jornada.',
      rarity: 88.6,
      tier: 'bronze'
    }
  ];
}
