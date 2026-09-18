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

import {
  PixelBookmark,
  PixelGlobe,
  PixelLogout,
  PixelSettings,
  PixelUser
} from '@/components/landing/game-pixel-icons';
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
  const { user: currentUser, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isGamesPage = pathname === '/games';
  const currentTab = isGamesPage ? searchParams?.get('tab') || 'descobrir' : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSearchIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSearchIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = searchResults[selectedSearchIndex];
      if (target) {
        setSearchOpen(false);
        router.push(`/games/${target.slug}`);
      }
    }
  };

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

  // Close user menu on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [userMenuOpen]);

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
  const gamesButtonRef = useRef<HTMLDivElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

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
    }, 120);
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
      <div className="pointer-events-none fixed inset-x-0 top-2.5 z-50 flex flex-col items-center px-2.5 sm:top-4 sm:px-4">
        <header className="pointer-events-auto relative flex h-11 w-full max-w-2xl items-center justify-between gap-1.5 rounded-full border border-white/[0.08] bg-[#121212]/95 px-2 shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all sm:h-12 sm:gap-4 sm:px-3.5">
          {/* Left: Logo & Nav Links */}
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Link
              href="/home"
              className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-white/[0.04] p-1.5 transition-colors hover:bg-white/[0.08] active:scale-95 sm:size-8"
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
                    <div
                      key={item.href}
                      ref={gamesButtonRef}
                      onMouseEnter={handleGamesMouseEnter}
                      onMouseLeave={handleGamesMouseLeave}
                      className="relative"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setGamesMenuOpen(false)}
                        className={`relative flex select-none items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-colors sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs ${
                          gamesMenuOpen ? 'text-white' : 'text-neutral-300 hover:text-white'
                        }`}
                      >
                        {(isActive || gamesMenuOpen) && (
                          <motion.div
                            layoutId="active-top-nav-pill"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="absolute inset-0 rounded-full bg-white/[0.12] shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                          <Icon className="size-3.5" />
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`size-3 transition-transform duration-100 ${
                              gamesMenuOpen ? 'rotate-180 text-white opacity-100' : 'opacity-70'
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
                    className="relative flex select-none items-center gap-1 rounded-full px-2 py-1 text-[11px] text-neutral-300 transition-colors hover:text-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-top-nav-pill"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="absolute inset-0 rounded-full bg-white/[0.12] shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1 sm:gap-1.5">
                      <Icon className="size-3.5" />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search Pill & User Profile */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Search Pill with CTRL+K */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex cursor-pointer select-none items-center gap-1.5 rounded-full bg-white/[0.04] p-1.5 text-neutral-400 text-xs transition-colors hover:bg-white/[0.08] hover:text-neutral-200 sm:px-3 sm:py-1"
              title="Buscar (Ctrl+K)"
            >
              <Search className="size-3.5 text-neutral-400" />
              <span className="hidden text-[11px] md:inline">Buscar</span>
              <kbd className="hidden items-center rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9px] text-neutral-400 sm:inline-flex">
                CTRL + K
              </kbd>
            </button>

            {/* User Avatar with dropdown */}
            {mounted && currentUser ? (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  title={`@${currentUser.username}`}
                  className={`flex size-7 items-center justify-center overflow-hidden rounded-full bg-neutral-800 transition-all hover:ring-2 hover:ring-white/20 active:scale-95 sm:size-8 ${
                    userMenuOpen ? 'ring-2 ring-white/25' : ''
                  }`}
                >
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.username}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-neutral-800 font-bold text-[10px] text-white uppercase">
                      {currentUser.username[0] || 'U'}
                    </div>
                  )}
                </button>

                {/* Avatar Dropdown */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ clipPath: 'inset(0% 0% 100% 0% round 16px)', opacity: 0 }}
                      animate={{ clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1 }}
                      exit={{ clipPath: 'inset(0% 0% 100% 0% round 16px)', opacity: 0 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-[calc(100%+8px)] right-0 z-50 w-48 max-w-[calc(100vw-2rem)] select-none overflow-hidden rounded-2xl border border-white/10 bg-[#121212]/95 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
                    >
                      {/* User info header */}
                      <div className="border-white/[0.06] border-b bg-white/[0.02] px-3.5 py-2.5">
                        <p className="truncate font-semibold text-[11px] text-white">
                          {currentUser.displayName || currentUser.username}
                        </p>
                        <p className="truncate text-[10px] text-neutral-500">
                          @{currentUser.username}
                        </p>
                      </div>

                      {/* Menu items */}
                      <div className="space-y-0.5 p-1.5">
                        {/* Profile */}
                        <Link
                          href={`/${currentUser.username}`}
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11.5px] text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <PixelUser
                            size={15}
                            className="shrink-0 text-neutral-400 group-hover:text-white"
                          />
                          <span>Perfil</span>
                        </Link>

                        {/* Saved / Lists */}
                        <Link
                          href="/lists"
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11.5px] text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <PixelBookmark
                            size={15}
                            className="shrink-0 text-neutral-400 group-hover:text-white"
                          />
                          <span>Minhas Listas</span>
                        </Link>

                        {/* Settings */}
                        <Link
                          href={`/${currentUser.username}/settings`}
                          onClick={() => setUserMenuOpen(false)}
                          className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11.5px] text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <PixelSettings
                            size={15}
                            className="shrink-0 text-neutral-400 group-hover:text-white"
                          />
                          <span>Configurações</span>
                        </Link>

                        {/* Language */}
                        <button
                          type="button"
                          className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11.5px] text-neutral-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          <PixelGlobe
                            size={15}
                            className="shrink-0 text-neutral-400 group-hover:text-white"
                          />
                          <span>Idioma</span>
                          <span className="ml-auto font-medium text-[10px] text-neutral-500">
                            PT-BR
                          </span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-white/[0.06] border-t bg-white/[0.01] p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false);
                            void logout();
                          }}
                          className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[11.5px] text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <PixelLogout
                            size={15}
                            className="shrink-0 text-rose-400 group-hover:text-rose-300"
                          />
                          <span>Sair</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 rounded-full bg-white/[0.05] px-2.5 text-white text-xs hover:bg-white/[0.1] sm:px-3"
              >
                <Link href="/auth">Entrar</Link>
              </Button>
            )}
          </div>
        </header>

        {/* Mega Menu Flyout Dropdown for "Jogos" */}
        <AnimatePresence>
          {gamesMenuOpen && (
            <motion.div
              ref={dropdownContainerRef}
              initial={{ clipPath: 'inset(0% 0% 100% 0% round 24px)', opacity: 0 }}
              animate={{ clipPath: 'inset(0% 0% 0% 0% round 24px)', opacity: 1 }}
              exit={{ clipPath: 'inset(0% 0% 100% 0% round 24px)', opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={handleGamesMouseEnter}
              onMouseLeave={handleGamesMouseLeave}
              className="pointer-events-auto relative mt-1.5 flex w-[640px] max-w-[94vw] select-none flex-col gap-3 rounded-3xl border border-white/10 bg-[#121212] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] will-change-transform"
            >
              {/* Invisible Hover Zone bridge so cursor movement between navbar and dropdown is 100% uninterrupted */}
              <div className="-top-3 pointer-events-auto absolute inset-x-0 z-10 h-4" />

              {/* Compact featured game */}
              <div className="w-full">
                <Link
                  href={`/games/${featuredAwaited?.slug || 'halloween-the-game'}`}
                  onClick={() => setGamesMenuOpen(false)}
                  className="group flex items-center gap-4 rounded-2xl bg-[#0A0A0A] p-2.5 transition-all hover:border-white/30 hover:bg-[#161616]"
                >
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#303030]">
                    <Image
                      src={
                        featuredAwaited?.coverUrl ||
                        'https://images.igdb.com/igdb/image/upload/t_cover_big/coc6x4.webp'
                      }
                      alt={featuredAwaited?.name || 'Halloween: The Game'}
                      fill
                      unoptimized
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
              </div>

              {/* Short category links */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DROPDOWN_OPTIONS.map((item) => {
                  const isTabActive = currentTab === item.tab;
                  const Icon = item.icon;
                  return (
                    <div key={item.tab}>
                      <Link
                        href={item.href}
                        onClick={() => setGamesMenuOpen(false)}
                        className={`group flex h-full flex-col gap-1.5 rounded-2xl p-3.5 text-left transition-[transform,background-color,border-color,box-shadow] duration-[80ms] ease-out hover:scale-[1.01] active:scale-[0.98] ${
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
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Search Command Palette Modal (CTRL + K) */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-16 backdrop-blur-md sm:pt-24">
            {/* Backdrop click to close */}
            <div
              className="fixed inset-0"
              onClick={() => setSearchOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]/95 shadow-[0_30px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            >
              {/* Search Header Input */}
              <div className="relative flex items-center border-white/[0.08] border-b px-4 py-3.5">
                <Search className="mr-3 size-4 shrink-0 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedSearchIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Buscar jogos por título, gênero ou franquia..."
                  className="w-full bg-transparent font-sans text-sm text-white placeholder-neutral-500 outline-none sm:text-base"
                />

                {isSearching ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-neutral-400" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="rounded-md p-1 text-neutral-400 hover:bg-white/[0.08] hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <kbd className="hidden rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 sm:inline-flex">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Quick Filter Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-white/[0.06] border-b bg-white/[0.01] px-4 py-2 text-xs">
                <span className="mr-1 text-[11px] text-neutral-500">Explorar:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push('/games?tab=descobrir');
                  }}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-neutral-300 hover:border-white/20 hover:text-white"
                >
                  Descobrir
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push('/games?tab=populares');
                  }}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-neutral-300 hover:border-white/20 hover:text-white"
                >
                  Populares
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push('/games?tab=bem-avaliados');
                  }}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-neutral-300 hover:border-white/20 hover:text-white"
                >
                  Mais Bem Avaliados
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push('/games?tab=lancamentos');
                  }}
                  className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-neutral-300 hover:border-white/20 hover:text-white"
                >
                  Lançamentos
                </button>
              </div>

              {/* Search Results / Suggestions Area */}
              <div className="max-h-[380px] overflow-y-auto p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2.5 py-12 text-neutral-400 text-xs">
                    <Loader2 className="size-4 animate-spin text-white" />
                    <span>Pesquisando no catálogo...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1 font-semibold text-[10.5px] text-neutral-500 uppercase tracking-wider">
                      Resultados ({searchResults.length})
                    </div>
                    {searchResults.map((game, index) => {
                      const isSelected = index === selectedSearchIndex;
                      return (
                        <button
                          key={game.id || game.slug}
                          type="button"
                          onMouseEnter={() => setSelectedSearchIndex(index)}
                          onClick={() => {
                            setSearchOpen(false);
                            router.push(`/games/${game.slug}`);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] ring-1 ring-white/15'
                              : 'hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="relative aspect-[2/3] w-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-neutral-800">
                            {game.coverUrl ? (
                              <Image
                                src={game.coverUrl}
                                alt={game.name}
                                fill
                                unoptimized
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex size-full items-center justify-center bg-neutral-800 text-neutral-600">
                                <Gamepad2 className="size-4" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-white text-xs sm:text-sm">
                                {game.name}
                              </p>
                              {game.releaseYear && (
                                <span className="shrink-0 text-[10.5px] text-neutral-400 tabular-nums">
                                  ({game.releaseYear})
                                </span>
                              )}
                            </div>
                            {game.genres && game.genres.length > 0 && (
                              <p className="truncate text-[11px] text-neutral-400">
                                {game.genres.slice(0, 3).join(' • ')}
                              </p>
                            )}
                          </div>

                          {game.rating && (
                            <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 font-bold text-[10.5px] text-white tabular-nums">
                              <Star className="size-2.5 fill-white text-white" />
                              <span>
                                {game.rating > 5
                                  ? (game.rating / 2).toFixed(1)
                                  : Number(game.rating).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-12 text-center text-neutral-400 text-xs">
                    <p className="font-medium text-neutral-300 text-sm">Nenhum título encontrado</p>
                    <p className="mt-1 text-neutral-500">
                      Não encontramos jogos para &ldquo;{searchQuery}&rdquo;. Tente buscar por
                      palavras-chave ou confira as abas do catálogo.
                    </p>
                  </div>
                ) : (
                  /* Quick Popular Suggestions & Genres */
                  <div className="space-y-4 p-3">
                    <div>
                      <span className="block px-1 pb-2 font-semibold text-[10.5px] text-neutral-500 uppercase tracking-wider">
                        Jogos Populares
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                        {[
                          'Elden Ring',
                          "Baldur's Gate 3",
                          'Cyberpunk 2077',
                          'The Witcher 3',
                          'Red Dead Redemption 2',
                          'Grand Theft Auto VI'
                        ].map((title) => (
                          <button
                            key={title}
                            type="button"
                            onClick={() => setSearchQuery(title)}
                            className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 text-left text-neutral-300 text-xs transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                          >
                            <Gamepad2 className="size-3.5 shrink-0 text-neutral-400" />
                            <span className="truncate">{title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="block px-1 pb-2 font-semibold text-[10.5px] text-neutral-500 uppercase tracking-wider">
                        Gêneros em Alta
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'RPG',
                          'Souls-like',
                          'Ação',
                          'Aventura',
                          'Indie',
                          'Mundo Aberto',
                          'Estratégia'
                        ].map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => setSearchQuery(genre)}
                            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Command Palette Keyboard Hints Footer */}
              <div className="flex items-center justify-between border-white/[0.06] border-t bg-white/[0.02] px-4 py-2.5 text-[11px] text-neutral-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.2 font-mono text-[9px]">
                      ↑↓
                    </kbd>
                    Navegar
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 py-0.2 font-mono text-[9px]">
                      ↵
                    </kbd>
                    Abrir jogo
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.2 font-mono text-[9px]">
                    ESC
                  </kbd>
                  Fechar
                </span>
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
