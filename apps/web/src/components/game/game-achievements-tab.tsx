'use client';

import confetti from 'canvas-confetti';
import {
  ArrowRight,
  ExternalLink,
  Gamepad2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/games';
import { GameAchievementCard } from './game-achievement-card';
import { GameStoreRewards, type StoreType } from './game-store-rewards';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  icon?: string;
  iconGray?: string;
  unlocked?: boolean;
  unlockTime?: number;
}

interface GameAchievementsTabProps {
  game: Game;
}

export function GameAchievementsTab({ game }: GameAchievementsTabProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const pathname = usePathname();

  const [selectedStore, setSelectedStore] = useState<StoreType>('steam');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const [isSteamConnectedOnServer, setIsSteamConnectedOnServer] = useState(false);
  const [isGameDetailsPrivate, setIsGameDetailsPrivate] = useState(false);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  const steamId =
    (user?.socials as any)?.steamId ||
    (user?.socials?.steam && /^\d{17}$/.test(user.socials.steam) ? user.socials.steam : undefined);
  const steamAccount = steamId || user?.socials?.steam;
  const isConnectedSteam = Boolean(steamAccount || isSteamConnectedOnServer);

  const fetchSteamAchievements = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        // The API derives the Steam ID from the authenticated user's linked account.
        // Do not send a client-controlled Steam ID to the server.
        const res = await fetch(`${apiBase}/steam/achievements/${game.slug}`, {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.achievements && data.achievements.length > 0) {
            const mapped = data.achievements.map((item: any) => ({
              id: item.id || item.apiName,
              name: item.name,
              description: item.description,
              rarity: item.rarity,
              tier: item.tier,
              icon: item.icon,
              iconGray: item.iconGray,
              unlocked: Boolean(item.achieved),
              unlockTime: item.unlockTime
            }));
            setAchievements(mapped);
            setIsSteamConnectedOnServer(Boolean(data.isConnected));

            const wasPrivate = isGameDetailsPrivate;
            const nowPrivate = Boolean(data.isGameDetailsPrivate);
            setIsGameDetailsPrivate(nowPrivate);

            // If it just became public and unlocked achievements were detected
            if (wasPrivate && !nowPrivate && mapped.some((a: Achievement) => a.unlocked)) {
              toast.success('Suas conquistas da Steam foram detectadas e sincronizadas!');
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            }
          } else {
            setAchievements([]);
          }
        } else {
          setAchievements([]);
        }
      } catch (err) {
        console.warn('[Achievements] Error fetching steam achievements:', err);
        setAchievements([]);
      } finally {
        setIsLoading(false);
      }
    },
    [game.slug, isGameDetailsPrivate]
  );

  // Load automatically as soon as tab is opened or user/game changes
  useEffect(() => {
    if (!isAuthLoading) {
      fetchSteamAchievements(false);
    }
  }, [fetchSteamAchievements, isAuthLoading]);

  // Automatic retry polling if privacy was detected as private (retry every 3.5s up to 10 times)
  useEffect(() => {
    if (isGameDetailsPrivate && isConnectedSteam && autoRetryCount < 10) {
      const timer = setTimeout(() => {
        setAutoRetryCount((c) => c + 1);
        fetchSteamAchievements(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isGameDetailsPrivate, isConnectedSteam, autoRetryCount, fetchSteamAchievements]);

  // Automatically revalidate when the user switches back to this browser tab/window
  useEffect(() => {
    const handleFocus = () => {
      fetchSteamAchievements(true);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchSteamAchievements]);

  // Check URL params for post-auth feedback
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('steam=connected')) {
      toast.success('Conta Steam conectada com sucesso!');
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      fetchSteamAchievements(false);
      window.history.replaceState({}, '', pathname);
    }
  }, [pathname, fetchSteamAchievements]);

  const handleManualRefresh = async () => {
    setIsSyncingSteam(true);
    setAutoRetryCount(0);
    try {
      await fetchSteamAchievements(false);
      toast.success('Conquistas atualizadas com a Steam!');
    } finally {
      setIsSyncingSteam(false);
    }
  };

  const handleConnectSteam = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const returnTo = pathname || window.location.pathname;
    window.location.href = `${apiBase}/auth/steam?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent =
    achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  const filteredAchievements = achievements.filter((ach) => {
    if (tierFilter !== 'all' && ach.tier !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return ach.name.toLowerCase().includes(q) || ach.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Modular Store Rewards Component (with platform filtering) */}
      <GameStoreRewards
        platforms={game.platforms}
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
        unlockedCount={unlockedCount}
        totalCount={achievements.length}
        progressPercent={progressPercent}
      />

      {/* Steam Connection Banner: Only appears if the user is NOT connected */}
      {selectedStore === 'steam' && (
        <div className="space-y-3">
          {!isConnectedSteam && (
            /* User is NOT connected to Steam -> Prominent 'Connect to your Steam' card */
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171a21]/90 via-[#1b2838]/60 to-black/80 p-5 shadow-xl backdrop-blur-md sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-lg">
                    <Gamepad2 className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white tracking-tight">
                        Conecte sua conta Steam
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-0.5 font-semibold text-[10px] text-neutral-300">
                        <Sparkles className="size-2.5 text-amber-300" />
                        Sincronização Oficial
                      </span>
                    </div>
                    <p className="max-w-xl text-neutral-300 text-xs leading-relaxed">
                      Conecte sua Steam para carregar automaticamente todas as suas conquistas
                      desbloqueadas, tempo de jogo e progresso nesta página sem precisar fazer nada
                      manualmente.
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleConnectSteam}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 font-semibold text-black text-xs shadow-lg transition-all hover:bg-neutral-200 active:scale-[0.98]"
                  >
                    <Gamepad2 className="size-4 text-black" />
                    <span>Conectar com a Steam</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Steam Privacy Warning Alert (when Steam is connected but 'Game Details' is private) */}
          {isConnectedSteam && isGameDetailsPrivate && (
            <div className="fade-in flex animate-in flex-col justify-between gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-xs duration-300 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" />
                <div className="space-y-1">
                  <p className="font-semibold text-amber-200">
                    Detalhes de jogos privados na sua Steam
                  </p>
                  <p className="max-w-2xl text-[11px] text-neutral-300 leading-relaxed">
                    Sua conta Steam está conectada, mas a Valve ainda não liberou o progresso de
                    conquistas porque a opção <strong>"Detalhes dos jogos"</strong> estava privada.
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-amber-300/90">
                    <RefreshCw className="size-3 animate-spin text-amber-400" />
                    <span>
                      Verificando atualização da Steam automaticamente em segundo plano...
                    </span>
                  </div>
                </div>
              </div>
              <a
                href="https://steamcommunity.com/my/edit/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/20 px-3.5 py-1.5 font-medium text-amber-200 text-xs transition-colors hover:bg-amber-500/30"
              >
                <span>Configurações da Steam</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* 2. Filter Chips & Search Bar */}
      {achievements.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          {/* Tier Filters with Liquid Pill */}
          <div className="relative flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1 sm:w-auto">
            {[
              { id: 'all', label: 'Todas', count: achievements.length },
              {
                id: 'platinum',
                label: 'Platina',
                count: achievements.filter((a) => a.tier === 'platinum').length
              },
              {
                id: 'gold',
                label: 'Ouro',
                count: achievements.filter((a) => a.tier === 'gold').length
              },
              {
                id: 'silver',
                label: 'Prata',
                count: achievements.filter((a) => a.tier === 'silver').length
              },
              {
                id: 'bronze',
                label: 'Bronze',
                count: achievements.filter((a) => a.tier === 'bronze').length
              }
            ]
              .filter((t) => t.count > 0 || t.id === 'all')
              .map((t) => {
                const isActive = tierFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierFilter(t.id)}
                    className={`relative cursor-pointer select-none whitespace-nowrap rounded-xl px-3 py-1.5 font-medium text-xs transition-colors ${
                      isActive ? 'font-semibold text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="tier-filter-liquid-pill"
                        className="absolute inset-0 rounded-xl bg-white shadow-sm"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 30
                        }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                );
              })}
          </div>

          {/* Quick Search & Sync */}
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar conquistas..."
                className="h-8.5 w-full rounded-xl border border-white/10 bg-black/60 pr-3 pl-8.5 text-white text-xs placeholder:text-neutral-500 focus:border-white/30 focus:outline-hidden"
              />
            </div>
            {isConnectedSteam && (
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isSyncingSteam}
                title="Sincronizar conquistas com Steam"
                className="flex size-8.5 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  className={`size-3.5 ${isSyncingSteam ? 'animate-spin text-amber-400' : ''}`}
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Achievements Content: Loading, Empty, or List */}
      {isLoading ? (
        <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
          <RefreshCw className="mx-auto size-6 animate-spin text-neutral-400" />
          <p className="text-neutral-400 text-xs">Carregando conquistas oficiais da Steam...</p>
        </div>
      ) : achievements.length === 0 ? (
        <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
          <Gamepad2 className="mx-auto size-8 text-neutral-600" />
          <h4 className="font-semibold text-sm text-white">
            Nenhuma conquista registrada na Steam
          </h4>
          <p className="mx-auto max-w-md text-neutral-400 text-xs leading-relaxed">
            Este jogo não possui conquistas cadastradas na Steam ou ainda não foi catalogado nesta
            loja.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAchievements.map((ach) => (
            <GameAchievementCard
              key={ach.id}
              achievement={ach}
              isUnlocked={Boolean(ach.unlocked)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
