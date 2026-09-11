'use client';

import {
  Calendar,
  ChevronDown,
  Gamepad2,
  Heart,
  Home,
  ListFilter,
  Loader2,
  Search,
  Sparkles,
  Star,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { type Game, getFeaturedAwaitedGame, searchGames } from '@/lib/games';

const DROPDOWN_OPTIONS = [
  {
    tab: 'descobrir',
    href: '/games?tab=descobrir',
    title: 'Descobrir',
    desc: 'Explore uma vasta seleção de jogos com filtros personalizados e opções de ordenação.',
    icon: Sparkles,
    activeColor: 'text-white',
    hoverColor: 'group-hover:text-white'
  },
  {
    tab: 'populares',
    href: '/games?tab=populares',
    title: 'Populares',
    desc: 'Confira os jogos que estão conquistando o público e dominando as listas de favoritos.',
    icon: Heart,
    activeColor: 'text-white',
    hoverColor: 'group-hover:text-white'
  },
  {
    tab: 'bem-avaliados',
    href: '/games?tab=bem-avaliados',
    title: 'Bem avaliados',
    desc: 'Explore os títulos mais aclamados, com as melhores avaliações do público e da crítica.',
    icon: Star,
    activeColor: 'text-white',
    hoverColor: 'group-hover:text-white'
  },
  {
    tab: 'lancamentos',
    href: '/games?tab=lancamentos',
    title: 'Lançamentos',
    desc: 'Confira os lançamentos populares e recentes do Steam em tempo real.',
    icon: Calendar,
    activeColor: 'text-white',
    hoverColor: 'group-hover:text-white'
  }
];

function TopNavContent({
  searchParams
}: {
  searchParams?: ReturnType<typeof useSearchParams> | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isGamesPage = pathname === '/games';
  const currentTab = isGamesPage ? searchParams?.get('tab') || 'descobrir' : null;

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global shortcut CTRL+K / CMD+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input on search open
  useEffect(() => {
    if (searchOpen) {
      const frame = requestAnimationFrame(() => searchInputRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    } else {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGames(searchQuery.trim(), controller.signal);
        setSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);
  const [featuredAwaited, setFeaturedAwaited] = useState<Game | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getFeaturedAwaitedGame()
      .then((game) => {
        if (game) setFeaturedAwaited(game);
      })
      .catch(() => {});
  }, []);

  const handleGamesMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setGamesMenuOpen(true);
  };

  const handleGamesMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setGamesMenuOpen(false);
    }, 280);
  };

  // Close menus on path change
  useEffect(() => {
    setGamesMenuOpen(false);
    setSearchOpen(false);
  }, []);

  const NAV_ITEMS = [
    { href: '/home', label: 'Início', icon: Home, exact: true },
    { href: '/games', label: 'Jogos', icon: Gamepad2, exact: false, hasDropdown: true },
    { href: '/lists', label: 'Listas', icon: ListFilter, exact: false }
  ];

  return (
    <>
      {/* Centralized Floating Capsule Bar */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center px-3 sm:top-4 sm:px-4">
        <header className="pointer-events-auto relative flex h-11 w-[calc(100vw-1rem)] min-w-0 max-w-2xl items-center justify-between gap-2 rounded-full bg-neutral-900/90 px-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all sm:h-12 sm:min-w-0 sm:gap-9 sm:px-3.5">
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/home"
              className="flex size-8 items-center justify-center rounded-full bg-white/[0.04] p-1.5 transition-colors hover:bg-white/[0.08] active:scale-95"
            >
              <Logos.Joysticked className="size-full text-white" />
            </Link>

            <nav className="flex items-center gap-0.5 font-medium text-xs sm:gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href || (item.href === '/' && pathname === '/home')
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                if (item.hasDropdown) {
                  return (
                    // biome-ignore lint/a11y/noStaticElementInteractions: Dropdown hover container
                    <div
                      key={item.href}
                      onMouseEnter={handleGamesMouseEnter}
                      onMouseLeave={handleGamesMouseLeave}
                      className="relative"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setGamesMenuOpen(false)}
                        className="relative flex select-none items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] text-neutral-300 transition-colors hover:text-white sm:px-3 sm:text-xs"
                      >
                        {(isActive || gamesMenuOpen) && (
                          <motion.div
                            layoutId="active-top-nav-pill"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.12] shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Icon className="size-3.5" />
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`size-3 opacity-70 transition-transform duration-200 ${
                              gamesMenuOpen ? 'rotate-180 text-white opacity-100' : ''
                            }`}
                          />
                        </span>
                      </Link>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative flex select-none items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] text-neutral-300 transition-colors hover:text-white sm:px-3 sm:text-xs"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-top-nav-pill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.12] shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon className="size-3.5" />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Pill & User Profile */}
          <div className="flex items-center gap-2">
            {/* Search Pill with CTRL+K */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex cursor-pointer select-none items-center gap-2 rounded-full bg-white/[0.04] px-2.5 py-1 text-neutral-400 text-xs transition-colors hover:bg-white/[0.08] hover:text-neutral-200 sm:px-3"
            >
              <Search className="size-3.5 text-neutral-400" />
              <span className="hidden text-[11px] md:inline">Procure por tudo</span>
              <kbd className="hidden items-center rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-neutral-400 sm:inline-flex">
                CTRL + K
              </kbd>
            </button>

            {/* User Avatar Circle */}
            {currentUser ? (
              <Link
                href={`/${currentUser.username}`}
                title={`@${currentUser.username}`}
                className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-neutral-800 transition-all hover:ring-2 hover:ring-white/20 active:scale-95 sm:size-8"
              >
                {currentUser.avatarUrl ? (
                  <Image
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-indigo-900 font-bold text-[10px] text-white uppercase">
                    {currentUser.username[0] || 'U'}
                  </div>
                )}
              </Link>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 rounded-full bg-white/[0.05] px-3 text-white text-xs hover:bg-white/[0.1]"
              >
                <Link href="/auth">Entrar</Link>
              </Button>
            )}
          </div>
        </header>

        {/* Mega Menu Flyout Dropdown for "Jogos" with Rich Spring Animations */}
        <AnimatePresence>
          {gamesMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              onMouseEnter={handleGamesMouseEnter}
              onMouseLeave={handleGamesMouseLeave}
              className="pointer-events-auto mt-2.5 flex w-[640px] max-w-[94vw] select-none flex-col gap-3 rounded-3xl border border-[#303030] bg-[#121212]/[0.98] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
            >
              {/* Compact featured game */}
              <motion.div
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-full"
              >
                <Link
                  href={`/games/${featuredAwaited?.slug || 'halloween-the-game'}`}
                  onClick={() => setGamesMenuOpen(false)}
                  className="group flex items-center gap-4 rounded-2xl border border-[#303030] bg-[#0A0A0A] p-2.5 transition-colors hover:border-white/30"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-[#303030]">
                    <Image
                      src={
                        featuredAwaited?.coverUrl ||
                        'https://images.igdb.com/igdb/image/upload/t_cover_big/coc6x4.webp'
                      }
                      alt={featuredAwaited?.name || 'Halloween: The Game'}
                      fill
                      sizes="56px"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] text-neutral-500 uppercase tracking-wider">
                      Em destaque
                    </span>
                    <span className="mt-0.5 block truncate font-bold text-sm text-white transition-colors group-hover:text-neutral-300">
                      {featuredAwaited?.name || 'Halloween: The Game'}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-neutral-500">
                      {featuredAwaited?.platforms?.[0] || 'PC (Steam)'} &bull; Em breve
                    </span>
                  </div>
                  <ChevronDown className="-rotate-90 size-4 shrink-0 text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </Link>
              </motion.div>

              {/* Short category links */}
              <div className="grid grid-cols-2 gap-2">
                {DROPDOWN_OPTIONS.map((item) => {
                  const isTabActive = currentTab === item.tab;
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.tab}
                      whileHover={{ scale: 1.025, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setGamesMenuOpen(false)}
                        className={`group flex h-full flex-col gap-1.5 rounded-2xl border p-3.5 text-left transition-all ${
                          isTabActive
                            ? 'border-white/25 bg-white/[0.1] text-white shadow-md ring-1 ring-white/10'
                            : 'border-[#303030] bg-[#0A0A0A]/50 text-neutral-300 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div
                          className={`flex items-center gap-1.5 font-bold text-xs transition-colors ${
                            isTabActive ? item.activeColor : `text-white ${item.hoverColor}`
                          }`}
                        >
                          <Icon
                            className={`size-3.5 ${
                              isTabActive
                                ? item.activeColor
                                : 'text-neutral-400 group-hover:text-white'
                            }`}
                          />
                          <span>{item.title}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed transition-colors group-hover:text-neutral-300">
                          {item.desc}
                        </p>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Search Modal (CTRL + K) */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 pt-20 backdrop-blur-md sm:pt-28">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl space-y-3 rounded-2xl bg-neutral-900/95 p-4 shadow-2xl"
            >
              {/* Search Bar Input */}
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 size-4 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procure por jogos, franquias, gêneros..."
                  className="w-full rounded-xl bg-white/[0.05] py-2.5 pr-10 pl-10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-neutral-400 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-3 rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 hover:text-white"
                  >
                    ESC
                  </button>
                )}
              </div>

              {/* Live Search Results */}
              <div className="max-h-[380px] space-y-1 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-center text-neutral-400 text-xs">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Buscando jogos...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((game) => (
                    <button
                      key={game.id || game.slug}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(`/games/${game.slug}`);
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <div className="relative aspect-[3/4] w-9 shrink-0 overflow-hidden rounded-md bg-neutral-800">
                        {game.coverUrl ? (
                          <Image
                            src={game.coverUrl}
                            alt={game.name}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-neutral-800 text-neutral-600">
                            <Gamepad2 className="size-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-white text-xs transition-colors group-hover:text-purple-300">
                            {game.name}
                          </p>
                          {game.releaseYear && (
                            <span className="shrink-0 text-[10px] text-neutral-400">
                              ({game.releaseYear})
                            </span>
                          )}
                        </div>
                        {game.genres && game.genres.length > 0 && (
                          <p className="truncate text-[10px] text-neutral-400">
                            {game.genres.slice(0, 2).join(' • ')}
                          </p>
                        )}
                      </div>

                      {game.rating && (
                        <div className="flex shrink-0 items-center gap-1 font-bold text-[10px] text-amber-300">
                          <Star className="size-2.5 fill-amber-300" />
                          <span>{Number(game.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </button>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="p-8 text-center text-neutral-400 text-xs">
                    Nenhum jogo encontrado para &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  <div className="p-6 text-center text-neutral-500 text-xs">
                    Digite o nome de um jogo para buscar rapidamente.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function TopNavWithParams() {
  const searchParams = useSearchParams();
  return <TopNavContent searchParams={searchParams} />;
}

export function TopNav() {
  return (
    <Suspense fallback={<TopNavContent searchParams={null} />}>
      <TopNavWithParams />
    </Suspense>
  );
}
