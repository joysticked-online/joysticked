'use client';

import {
  Check,
  ChevronDown,
  Gamepad2,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { FadeDots } from '@/components/ui/fade-dots';
import { PosterImage } from '@/components/ui/poster-image';
import {
  type Game,
  getDiscoverGames,
  getPopularGames,
  getPopularNewReleases,
  getTopRatedGames,
  searchGames
} from '@/lib/games';

interface GamesExplorerViewProps {
  initialPopularGames: Game[];
  initialTopRatedGames?: Game[];
  initialUpcomingGames?: Game[];
  initialDiscoverGames?: Game[];
}

const TAB_CONFIG: Record<string, { title: string; subtitle: string; badge: string }> = {
  descobrir: {
    title: 'Descubra',
    subtitle: 'Explore títulos personalizados de acordo com seus jogos favoritos e estilo de jogo.',
    badge: 'Resultados inteligentes baseados no que você jogou'
  },
  populares: {
    title: 'Populares',
    subtitle: 'Confira os jogos que estão conquistando o público e dominando as listas.',
    badge: 'Mais populares de todos os tempos'
  },
  'bem-avaliados': {
    title: 'Bem avaliados',
    subtitle:
      'Explore os títulos mais aclamados, com as melhores avaliações do público e da crítica.',
    badge: 'Melhores notas pela crítica e jogadores'
  },
  lancamentos: {
    title: 'Lançamentos',
    subtitle:
      'Confira os lançamentos mais populares e recentes do Steam, com capas e dados sincronizados.',
    badge: 'Lançamentos Populares no Steam'
  }
};

const GENRES = [
  'Todos',
  'Ação',
  'RPG',
  'Aventura',
  'Tiro',
  'Estratégia',
  'Esportes',
  'Indie',
  'Simulador'
];

const PLATFORMS = ['Todas', 'PC', 'PlayStation', 'Xbox', 'Nintendo Switch'];
const MODES = ['Todos', 'Single player', 'Multiplayer'];

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative space-y-1 ${isOpen ? 'z-30' : 'z-10'}`}>
      <span className="font-medium text-[11px] text-neutral-400">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex h-9.5 w-full items-center justify-between rounded-xl border px-3 text-left text-xs transition-all duration-200 ${
          isOpen
            ? 'border-white/25 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_0_3px_rgba(255,255,255,0.04)]'
            : 'border-white/[0.08] bg-white/[0.04] text-neutral-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.16] hover:bg-white/[0.07]'
        }`}
      >
        <span className="truncate">{value}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-3.5 text-neutral-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#161616]/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_18px_36px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  option === value
                    ? 'bg-white font-medium text-black shadow-sm'
                    : 'text-neutral-300 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span>{option}</span>
                {option === value && <Check className="size-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Extracts played game slugs from local storage (reviews, collection status, played list).
 */
function getStoredPlayedSlugs(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const playedSet = new Set<string>();

    // 1. Array in joysticked_played_games
    const raw = localStorage.getItem('joysticked_played_games');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          if (typeof s === 'string') playedSet.add(s.toLowerCase().trim());
        }
      }
    }

    // 2. Scan keys for local_reviews_* and game_status_*
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('local_reviews_')) {
        const slug = key.replace('local_reviews_', '').trim();
        if (slug) playedSet.add(slug.toLowerCase());
      } else if (key.startsWith('game_status_')) {
        const status = localStorage.getItem(key);
        if (status === 'Jogado' || status === 'Jogando') {
          const slug = key.replace('game_status_', '').trim();
          if (slug) playedSet.add(slug.toLowerCase());
        }
      }
    }

    return Array.from(playedSet);
  } catch {
    return [];
  }
}

function ExplorerContent({
  initialPopularGames,
  initialTopRatedGames = [],
  initialUpcomingGames = [],
  initialDiscoverGames = []
}: GamesExplorerViewProps) {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') || 'descobrir';
  const tab = TAB_CONFIG[rawTab] ? rawTab : 'descobrir';
  const config = TAB_CONFIG[tab];

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('Todos');
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');
  const [minimumScore, setMinimumScore] = useState(0);
  const [selectedMode, setSelectedMode] = useState('Todos');

  const filterPopoverRef = useRef<HTMLDivElement | null>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.trim()) count++;
    if (selectedGenre !== 'Todos') count++;
    if (selectedPlatform !== 'Todas') count++;
    if (minimumScore > 0) count++;
    if (selectedMode !== 'Todos') count++;
    return count;
  }, [query, selectedGenre, selectedPlatform, minimumScore, selectedMode]);

  useEffect(() => {
    if (!showFilters) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowFilters(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFilters]);

  // Dynamic paginated list for the active tab
  const [gamesList, setGamesList] = useState<Game[]>(() => {
    if (tab === 'descobrir') {
      return initialDiscoverGames.length > 0 ? initialDiscoverGames : initialPopularGames;
    }
    if (tab === 'bem-avaliados') {
      return initialTopRatedGames.length > 0 ? initialTopRatedGames : initialPopularGames;
    }
    if (tab === 'lancamentos') {
      return initialUpcomingGames.length > 0 ? initialUpcomingGames : initialPopularGames;
    }
    return initialPopularGames;
  });

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [basedOnTitles, setBasedOnTitles] = useState<string[]>([]);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      searchGames(query.trim())
        .then((games) => setSearchResults(games))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset or personalize gamesList whenever tab changes or on mount
  useEffect(() => {
    setHasMore(true);
    setIsLoadingMore(false);

    if (tab === 'descobrir') {
      const played = getStoredPlayedSlugs();
      if (played.length > 0) {
        setIsPersonalizing(true);
        getDiscoverGames({ played, limit: 21, offset: 0 })
          .then((res) => {
            if (res.games.length > 0) {
              // Ensure we display at least 21 titles: if personalized has less than 21, supplement from initial games
              const combined = [...res.games];
              if (combined.length < 21) {
                const pool =
                  initialDiscoverGames.length > 0 ? initialDiscoverGames : initialPopularGames;
                for (const g of pool) {
                  if (!combined.some((item) => (item.id || item.slug) === (g.id || g.slug))) {
                    combined.push(g);
                    if (combined.length >= 21) break;
                  }
                }
              }
              setGamesList(combined);
              setBasedOnTitles(res.basedOn);
              setHasMore(res.hasMore);
            } else {
              setGamesList(
                initialDiscoverGames.length > 0 ? initialDiscoverGames : initialPopularGames
              );
            }
          })
          .catch(() => {
            setGamesList(
              initialDiscoverGames.length > 0 ? initialDiscoverGames : initialPopularGames
            );
          })
          .finally(() => setIsPersonalizing(false));
      } else {
        setGamesList(initialDiscoverGames.length > 0 ? initialDiscoverGames : initialPopularGames);
        setBasedOnTitles([]);
      }
    } else if (tab === 'bem-avaliados') {
      setGamesList(initialTopRatedGames.length > 0 ? initialTopRatedGames : initialPopularGames);
      setBasedOnTitles([]);
    } else if (tab === 'lancamentos') {
      setGamesList(initialUpcomingGames.length > 0 ? initialUpcomingGames : initialPopularGames);
      setBasedOnTitles([]);
    } else {
      setGamesList(initialPopularGames);
      setBasedOnTitles([]);
    }
  }, [tab, initialDiscoverGames, initialPopularGames, initialTopRatedGames, initialUpcomingGames]);

  // Infinite Scroll fetcher (loads in batches of 21 titles)
  const loadMoreGames = useCallback(async () => {
    if (
      isLoadingMore ||
      !hasMore ||
      query.trim() ||
      selectedGenre !== 'Todos' ||
      selectedPlatform !== 'Todas' ||
      minimumScore > 0 ||
      selectedMode !== 'Todos' ||
      gamesList.length < 21
    )
      return;

    setIsLoadingMore(true);
    const currentOffset = gamesList.length;

    try {
      if (tab === 'descobrir') {
        const played = getStoredPlayedSlugs();
        const res = await getDiscoverGames({
          played,
          limit: 21,
          offset: currentOffset
        });

        if (res.games.length > 0) {
          setGamesList((prev) => {
            const existingKeys = new Set(prev.map((g) => `${g.id || ''}-${g.slug}`));
            const unique = res.games.filter((g) => !existingKeys.has(`${g.id || ''}-${g.slug}`));
            return [...prev, ...unique];
          });
          setHasMore(res.hasMore && res.games.length >= 7);
        } else {
          setHasMore(false);
        }
      } else if (tab === 'populares') {
        const newGames = await getPopularGames(21, currentOffset);
        if (newGames.length > 0) {
          setGamesList((prev) => {
            const existingKeys = new Set(prev.map((g) => `${g.id || ''}-${g.slug}`));
            const unique = newGames.filter((g) => !existingKeys.has(`${g.id || ''}-${g.slug}`));
            return [...prev, ...unique];
          });
          setHasMore(newGames.length >= 21);
        } else {
          setHasMore(false);
        }
      } else if (tab === 'bem-avaliados') {
        const newGames = await getTopRatedGames(21, currentOffset);
        if (newGames.length > 0) {
          setGamesList((prev) => {
            const existingKeys = new Set(prev.map((g) => `${g.id || ''}-${g.slug}`));
            const unique = newGames.filter((g) => !existingKeys.has(`${g.id || ''}-${g.slug}`));
            return [...prev, ...unique];
          });
          setHasMore(newGames.length >= 21);
        } else {
          setHasMore(false);
        }
      } else if (tab === 'lancamentos') {
        const newGames = await getPopularNewReleases(21, currentOffset);
        if (newGames.length > 0) {
          setGamesList((prev) => {
            const existingKeys = new Set(prev.map((g) => `${g.id || ''}-${g.slug}`));
            const unique = newGames.filter((g) => !existingKeys.has(`${g.id || ''}-${g.slug}`));
            return [...prev, ...unique];
          });
          setHasMore(newGames.length >= 21);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.warn('Error loading more games on scroll:', err);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    hasMore,
    query,
    selectedGenre,
    selectedPlatform,
    minimumScore,
    selectedMode,
    gamesList.length,
    tab
  ]);

  // Observer on Sentinel
  useEffect(() => {
    if (
      !hasMore ||
      isLoadingMore ||
      query.trim() ||
      selectedGenre !== 'Todos' ||
      selectedPlatform !== 'Todas' ||
      minimumScore > 0 ||
      selectedMode !== 'Todos' ||
      gamesList.length < 21
    )
      return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreGames();
        }
      },
      { rootMargin: '100px' } // Only triggers when user scrolls near the bottom of 21 titles
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    hasMore,
    isLoadingMore,
    query,
    selectedGenre,
    selectedPlatform,
    minimumScore,
    selectedMode,
    loadMoreGames,
    gamesList.length
  ]);

  // Apply search and genre filter
  const displayGames = useMemo(() => {
    let list = query.trim() ? searchResults : gamesList;

    if (selectedGenre !== 'Todos') {
      const genreLower = selectedGenre.toLowerCase();
      list = list.filter((g) =>
        (g.genres || []).some((genre) => genre.toLowerCase().includes(genreLower))
      );
    }

    if (selectedPlatform !== 'Todas') {
      const platformLower = selectedPlatform.toLowerCase();
      list = list.filter((g) =>
        (g.platforms || []).some((platform) => platform.toLowerCase().includes(platformLower))
      );
    }

    if (minimumScore > 0) {
      list = list.filter((g) => Number(g.rating || 0) >= minimumScore);
    }

    if (selectedMode !== 'Todos') {
      const modeLower = selectedMode.toLowerCase();
      list = list.filter((g) =>
        (g.gameModes || []).some((mode) => mode.toLowerCase().includes(modeLower))
      );
    }

    return list;
  }, [
    query,
    searchResults,
    gamesList,
    selectedGenre,
    selectedPlatform,
    minimumScore,
    selectedMode
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
      {/* Centralized Floating Capsule Bar */}
      <TopNav />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-24 sm:px-6 sm:pt-28 md:px-8">
        {/* Header */}
        <header className="mb-6 space-y-3 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-bold font-redaction text-2xl text-white tracking-tight sm:text-4xl md:text-5xl">
                  {config.title}
                </h1>
                {isPersonalizing && (
                  <div className="inline-flex animate-pulse items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] text-amber-400/80">
                    <Sparkles className="size-3" />
                    <span>Calibrando...</span>
                  </div>
                )}
              </div>
              <p className="mt-1 max-w-2xl text-neutral-400 text-xs leading-relaxed sm:text-sm">
                {config.subtitle}
              </p>
            </div>

            {/* Filter Toggle Button & Anchored Popover */}
            <div className="relative z-30" ref={filterPopoverRef}>
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                aria-expanded={showFilters}
                aria-controls="games-filter-popover"
                className={`relative flex size-10 select-none items-center justify-center rounded-xl border transition-all active:scale-[0.96] ${
                  showFilters
                    ? 'border-white/30 bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_8px_24px_rgba(255,255,255,0.15)]'
                    : 'border-white/[0.08] bg-white/[0.04] text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white'
                }`}
                title="Filtrar jogos"
              >
                <SlidersHorizontal className="size-4.5" />
                {activeFilterCount > 0 && (
                  <span className="-top-1 -right-1 absolute flex size-4 items-center justify-center rounded-full bg-white font-bold text-[10px] text-black ring-2 ring-[#0a0a0a]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showFilters && (
                  <>
                    {/* Backdrop to capture outside clicks */}
                    <div
                      className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1.5px]"
                      onClick={() => setShowFilters(false)}
                      aria-hidden="true"
                    />

                    {/* Popover pulled directly from the filter button */}
                    <motion.div
                      id="games-filter-popover"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
                      className="absolute top-full right-0 z-50 mt-2.5 flex w-[330px] max-w-[calc(100vw-2rem)] origin-top-right flex-col overflow-hidden rounded-2xl bg-[#121212]/80 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl backdrop-saturate-150 sm:w-[360px]"
                    >
                      {/* Subtle liquid glass sheen overlay */}
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.07] via-transparent to-transparent" />

                      <div className="relative mb-3 flex items-center justify-between border-white/[0.08] border-b pb-3">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="size-4 text-neutral-400" />
                          <span className="font-semibold text-white text-xs">Filtros</span>
                          {activeFilterCount > 0 && (
                            <span className="rounded-full border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-medium text-[10px] text-neutral-200">
                              {activeFilterCount}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowFilters(false)}
                          aria-label="Fechar filtros"
                          className="flex size-7 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>

                      <div className="relative max-h-[min(68vh,520px)] space-y-3.5 overflow-y-auto pr-0.5">
                        <div className="relative flex items-center">
                          <Search className="pointer-events-none absolute left-3 size-3.5 text-neutral-500" />
                          <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar pelo título exato..."
                            className="h-9.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pr-8 pl-8 text-white text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all placeholder:text-neutral-500 hover:border-white/[0.16] hover:bg-white/[0.06] focus:border-white/25 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
                          />
                          {query && (
                            <button
                              type="button"
                              onClick={() => setQuery('')}
                              aria-label="Limpar busca"
                              className="absolute right-2.5 text-neutral-500 transition-colors hover:text-white"
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>

                        <FilterSelect
                          label="Gênero"
                          value={selectedGenre}
                          options={GENRES}
                          onChange={setSelectedGenre}
                        />
                        <FilterSelect
                          label="Plataforma"
                          value={selectedPlatform}
                          options={PLATFORMS}
                          onChange={setSelectedPlatform}
                        />

                        <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="minimum-score"
                              className="font-medium text-[11px] text-neutral-400"
                            >
                              Nota mínima
                            </label>
                            <output
                              htmlFor="minimum-score"
                              className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-semibold text-[10px] text-white"
                            >
                              {minimumScore === 0 ? 'Todas' : `${minimumScore.toFixed(1)}+`}
                            </output>
                          </div>
                          <div className="relative px-1 pt-2">
                            <input
                              id="minimum-score"
                              type="range"
                              min="0"
                              max="5"
                              step="0.5"
                              value={minimumScore}
                              onChange={(event) => setMinimumScore(Number(event.target.value))}
                              className="relative z-10 h-1.5 w-full cursor-pointer accent-white"
                            />
                            <div className="mt-1.5 flex justify-between text-[9px] text-neutral-500">
                              {Array.from({ length: 11 }, (_, index) => {
                                const score = index / 2;
                                return (
                                  <span
                                    key={score}
                                    className={
                                      minimumScore === score ? 'font-semibold text-white' : ''
                                    }
                                  >
                                    {score % 1 === 0 ? score : score.toFixed(1)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <FilterSelect
                          label="Modo de jogo"
                          value={selectedMode}
                          options={MODES}
                          onChange={setSelectedMode}
                        />
                      </div>

                      <div className="relative mt-3 grid grid-cols-2 gap-2 border-white/[0.08] border-t pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('');
                            setSelectedGenre('Todos');
                            setSelectedPlatform('Todas');
                            setMinimumScore(0);
                            setSelectedMode('Todos');
                          }}
                          className="h-9 rounded-xl border border-white/[0.09] bg-white/[0.03] text-neutral-300 text-xs transition-colors hover:border-white/[0.16] hover:bg-white/[0.08] hover:text-white"
                        >
                          Limpar tudo
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowFilters(false)}
                          className="h-9 rounded-xl bg-white font-semibold text-black text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(255,255,255,0.12)] transition-transform hover:bg-neutral-100 active:scale-[0.98]"
                        >
                          Ver resultados
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Subtitle Badge Pill & Personalization Info */}
          <div className="flex flex-wrap items-center gap-2">
            {tab === 'descobrir' && basedOnTitles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 font-medium text-[11.5px] text-amber-300 shadow-sm"
              >
                <Sparkles className="size-3 text-amber-400" />
                <span>
                  Baseado no que você jogou:{' '}
                  <strong className="font-semibold text-white">
                    {basedOnTitles.slice(0, 3).join(', ')}
                  </strong>
                </span>
              </motion.div>
            ) : (
              <span className="inline-flex select-none items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1 font-medium text-[11px] text-neutral-300">
                <Sparkles className="size-3 text-amber-400" />
                <span>{config.badge}</span>
              </span>
            )}

            {selectedGenre !== 'Todos' && (
              <button
                type="button"
                onClick={() => setSelectedGenre('Todos')}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10.5px] text-white transition-colors hover:bg-white/[0.12]"
              >
                <span>{selectedGenre}</span>
                <X className="size-3 text-neutral-400" />
              </button>
            )}

            {selectedPlatform !== 'Todas' && (
              <button
                type="button"
                onClick={() => setSelectedPlatform('Todas')}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10.5px] text-white transition-colors hover:bg-white/[0.12]"
              >
                <span>{selectedPlatform}</span>
                <X className="size-3 text-neutral-400" />
              </button>
            )}

            {minimumScore > 0 && (
              <button
                type="button"
                onClick={() => setMinimumScore(0)}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10.5px] text-white transition-colors hover:bg-white/[0.12]"
              >
                <span>Nota {minimumScore.toFixed(1)}+</span>
                <X className="size-3 text-neutral-400" />
              </button>
            )}

            {selectedMode !== 'Todos' && (
              <button
                type="button"
                onClick={() => setSelectedMode('Todos')}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10.5px] text-white transition-colors hover:bg-white/[0.12]"
              >
                <span>{selectedMode}</span>
                <X className="size-3 text-neutral-400" />
              </button>
            )}
          </div>
        </header>

        {/* Compact & High-Density Poster Grid */}
        {displayGames.length === 0 && !isSearching ? (
          <div className="space-y-3 rounded-2xl border border-white/[0.04] bg-neutral-900/30 p-16 text-center">
            <Gamepad2 className="mx-auto size-10 text-neutral-600" />
            <p className="font-semibold text-neutral-300 text-sm">Nenhum título encontrado</p>
            <p className="text-neutral-500 text-xs">
              Tente redefinir os filtros ou buscar por outro termo.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedGenre('Todos');
                setSelectedPlatform('Todas');
                setMinimumScore(0);
                setSelectedMode('Todos');
              }}
              className="pt-1 text-white text-xs underline underline-offset-4"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {displayGames.map((game, idx) => (
              <motion.div
                key={`${game.id || game.slug}-${idx}`}
                whileHover={{ y: -5, scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Link
                  href={`/games/${game.slug}`}
                  className="group relative block aspect-[2/3] cursor-pointer overflow-hidden rounded-xl border border-white/[0.04] bg-neutral-900 shadow-md transition-all hover:border-white/20 hover:shadow-[0_12px_28px_rgba(0,0,0,0.8)]"
                >
                  {/* Poster Cover Image with Smooth Skeleton Shimmer */}
                  <PosterImage src={game.coverUrl} alt={game.name} />

                  {/* Rating / Steam Awaited / Steam New Release Badge */}
                  {game.isSteamNewRelease ? (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md border border-emerald-500/30 bg-black/85 px-1.5 py-0.5 font-bold text-[8.5px] text-emerald-400 shadow backdrop-blur-md">
                      <Sparkles className="size-2" />
                      <span>Steam</span>
                    </div>
                  ) : game.isSteamAwaited ? (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md border border-amber-500/30 bg-black/85 px-1.5 py-0.5 font-bold text-[8.5px] text-amber-400 shadow backdrop-blur-md">
                      <Sparkles className="size-2" />
                      <span>Aguardado</span>
                    </div>
                  ) : game.rating ? (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-black/75 px-1.5 py-0.5 font-bold text-[9px] text-amber-300 shadow backdrop-blur-md">
                      <Star className="size-2 fill-amber-300 text-amber-300" />
                      <span>{game.rating.toFixed(1)}</span>
                    </div>
                  ) : game.releaseYear ? (
                    <div className="absolute top-1.5 right-1.5 rounded-md bg-black/75 px-1.5 py-0.5 font-semibold text-[8.5px] text-neutral-300 backdrop-blur-md">
                      {game.releaseYear}
                    </div>
                  ) : null}

                  {/* Bottom Dark Gradient with Game Title */}
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/25 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="line-clamp-2 font-semibold text-[11px] text-white leading-tight">
                      {game.name}
                    </span>
                    {game.genres?.[0] && (
                      <span className="mt-0.5 truncate text-[9px] text-neutral-400">
                        {game.genres[0]}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Sentinel & Infinite Scroll Loader */}
        <div
          ref={sentinelRef}
          className="flex w-full flex-col items-center justify-center gap-2 py-8"
        >
          {isLoadingMore && (
            <div className="flex flex-col items-center gap-2 py-4">
              <FadeDots />
              <span className="font-medium text-[11px] text-neutral-500 tracking-wide">
                Carregando mais opções...
              </span>
            </div>
          )}
          {!hasMore &&
            gamesList.length > 0 &&
            !query.trim() &&
            selectedGenre === 'Todos' &&
            selectedPlatform === 'Todas' &&
            minimumScore === 0 &&
            selectedMode === 'Todos' && (
              <p className="font-medium text-[11px] text-neutral-600 tracking-wide">
                Você chegou ao final dos títulos disponíveis.
              </p>
            )}
        </div>
      </main>

      {/* Floating Micro-Pill (Bottom Right) */}
      <div className="fixed right-5 bottom-5 z-40">
        <Link
          href="/pro"
          className="group flex select-none items-center gap-2 rounded-full border border-white/[0.06] bg-neutral-900/90 px-3.5 py-1.5 text-neutral-200 text-xs shadow-2xl backdrop-blur-md transition-all hover:bg-neutral-800 active:scale-95"
        >
          <Sparkles className="size-3.5 text-amber-400 transition-transform group-hover:rotate-12" />
          <span className="font-medium text-[11.5px] sm:text-xs">
            Ganhe 7 dias grátis do plano PRO
          </span>
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-1.5 py-0.2 font-extrabold text-[9px] text-black uppercase tracking-wider">
            PRO
          </span>
        </Link>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export function GamesExplorerView(props: GamesExplorerViewProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-neutral-950">
          <Loader2 className="size-6 animate-spin text-neutral-500" />
        </div>
      }
    >
      <ExplorerContent {...props} />
    </Suspense>
  );
}
