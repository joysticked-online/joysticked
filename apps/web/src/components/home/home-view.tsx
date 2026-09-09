'use client';

import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Gamepad2,
  MessageSquare,
  Play,
  Sparkles,
  Star,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { PosterImage } from '@/components/ui/poster-image';
import type { Game, GameActivity, GameReview, HomeFeedData } from '@/lib/games';

const FALLBACK_POPULAR_GAMES: Game[] = [
  {
    id: 3001,
    name: 'EA SPORTS FC 24',
    slug: 'ea-sports-fc-24',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6q78.webp',
    rating: 3.8
  },
  {
    id: 119133,
    name: 'Elden Ring',
    slug: 'elden-ring',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    rating: 4.8
  },
  {
    id: 1877,
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co825v.webp',
    rating: 4.3
  }
];

const FALLBACK_TOP_RATED_GAMES: Game[] = [
  {
    id: 1020,
    name: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    rating: 4.9
  },
  {
    id: 1942,
    name: 'The Witcher 3: Wild Hunt',
    slug: 'the-witcher-3-wild-hunt',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
    rating: 4.9
  },
  {
    id: 1192,
    name: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
    rating: 4.9
  }
];

const FALLBACK_UPCOMING_GAMES: Game[] = [
  {
    id: 3219630,
    name: 'Halloween: The Game',
    slug: 'halloween-the-game',
    coverUrl:
      'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/3219630/library_600x900.jpg',
    releaseYear: 'Em breve',
    isSteamAwaited: true
  },
  {
    id: 1867240,
    name: 'WARDOGS',
    slug: 'wardogs',
    coverUrl:
      'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1867240/library_600x900.jpg',
    releaseYear: 'Em breve',
    isSteamAwaited: true
  },
  {
    id: 119171,
    name: 'Grand Theft Auto VI',
    slug: 'grand-theft-auto-vi',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v2e.webp',
    releaseYear: '2025',
    isSteamAwaited: true
  }
];

const PERIOD_TABS = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Essa semana' },
  { id: 'month', label: 'Esse mês' },
  { id: 'all', label: 'Sempre' }
] as const;

interface HomeViewProps {
  initialData?: HomeFeedData | null;
}

export function HomeView({ initialData }: HomeViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [recentPlayedSlugs, setRecentPlayedSlugs] = useState<string[]>([]);

  // Load client's recently played / reviewed games
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem('joysticked_played_games') || '[]');
      if (Array.isArray(stored)) {
        setRecentPlayedSlugs(stored.slice(0, 4));
      }
    } catch {}
  }, []);

  const popularGames =
    initialData?.popularGames && initialData.popularGames.length > 0
      ? initialData.popularGames.slice(0, 3)
      : FALLBACK_POPULAR_GAMES;

  const topRatedGames =
    initialData?.topRatedGames && initialData.topRatedGames.length > 0
      ? initialData.topRatedGames.slice(0, 3)
      : FALLBACK_TOP_RATED_GAMES;

  const upcomingGames =
    initialData?.upcomingGames && initialData.upcomingGames.length > 0
      ? initialData.upcomingGames.slice(0, 3)
      : FALLBACK_UPCOMING_GAMES;

  const reviews: GameReview[] = initialData?.popularReviews || [];
  const activities: GameActivity[] = initialData?.activities || [];

  const filteredReviews = reviews.filter((review) => {
    if (selectedPeriod === 'all') return true;

    const createdAt = new Date(review.createdAt);
    if (Number.isNaN(createdAt.getTime())) return false;

    const now = new Date();
    let periodStart: Date;

    if (selectedPeriod === 'today') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (selectedPeriod === 'week') {
      const day = now.getDay();
      const daysSinceMonday = (day + 6) % 7;
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
    } else {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return createdAt >= periodStart && createdAt <= now;
  });

  // Spotlight game (featured top-rated title)
  const spotlightGame = topRatedGames[0] || popularGames[0];

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
      {/* Centralized Floating Top Navigation */}
      <TopNav />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-20 pb-20 sm:px-6 sm:pt-24 md:px-8">
        {/* Page Header */}
        <header className="mb-6 space-y-3">
          <div>
            <h1 className="font-bold font-redaction text-2xl text-white tracking-tight sm:text-4xl">
              Início
            </h1>
            <p className="mt-0.5 text-neutral-400 text-xs sm:text-sm">
              Visão geral de suas atividades, destaques e tendências na comunidade.
            </p>
          </div>

          {/* Quick Platform Metrics Ticker */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1">
              <Gamepad2 className="size-3 text-indigo-400" />
              <span>
                <strong>12.400+</strong> Jogos
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1">
              <Star className="size-3 text-amber-400" />
              <span>
                <strong>48.200+</strong> Avaliações
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.04] px-3 py-1">
              <Award className="size-3 text-emerald-400" />
              <span>
                <strong>185.000+</strong> Conquistas Sincronizadas
              </span>
            </div>
          </div>
        </header>

        {/* 2-Column Responsive Dashboard */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT COLUMN: Main Feed (8 cols on lg) */}
          <section className="space-y-7 lg:col-span-8">
            {/* Cinematic Spotlight: Destaque do Dia */}
            {spotlightGame && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-neutral-900/80 shadow-2xl backdrop-blur-md"
              >
                {/* Background Subtle Artwork Glow */}
                <div
                  className="absolute inset-0 bg-center bg-cover opacity-25 blur-xl filter transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${spotlightGame.bannerUrl || spotlightGame.coverUrl})`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />

                <div className="relative z-10 flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                  {/* Spotlight Poster with Skeleton */}
                  <div className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:w-28">
                    <PosterImage
                      src={spotlightGame.coverUrl}
                      alt={spotlightGame.name}
                      priority
                      sizes="120px"
                    />
                  </div>

                  {/* Spotlight Info */}
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 font-bold text-[10.5px] text-amber-300">
                      <Sparkles className="size-3 text-amber-400" />
                      <span>Destaque da Comunidade</span>
                    </div>

                    <h2 className="font-bold font-redaction text-lg text-white leading-snug tracking-tight sm:text-2xl">
                      {spotlightGame.name}
                    </h2>

                    {spotlightGame.summary && (
                      <p className="line-clamp-2 text-neutral-300 text-xs leading-relaxed">
                        {spotlightGame.summary}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {spotlightGame.rating && (
                        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 font-bold text-amber-300 text-xs">
                          <Star className="size-3 fill-amber-300 text-amber-300" />
                          <span>{spotlightGame.rating.toFixed(1)}</span>
                        </div>
                      )}
                      <Link
                        href={`/games/${spotlightGame.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 font-semibold text-black text-xs shadow-sm transition-colors hover:bg-neutral-200"
                      >
                        <span>Explorar Título</span>
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* "Continue de onde parou" / Jogos Recentes */}
            {recentPlayedSlugs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="size-4 text-emerald-400" />
                    <h2 className="font-bold font-redaction text-base text-white sm:text-xl">
                      Continue de onde parou
                    </h2>
                  </div>
                  <Link
                    href="/games?tab=descobrir"
                    className="text-neutral-400 text-xs transition-colors hover:text-white"
                  >
                    Ver recomendações
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {recentPlayedSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={`/games/${slug}`}
                      className="group flex items-center gap-2.5 rounded-2xl border border-white/[0.05] bg-neutral-900/60 p-2.5 shadow-sm transition-all hover:border-white/20 hover:bg-neutral-900"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-800 text-white transition-transform group-hover:scale-105">
                        <Gamepad2 className="size-4.5 text-neutral-400 transition-colors group-hover:text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-white text-xs capitalize transition-colors group-hover:text-amber-300">
                          {slug.replace(/-/g, ' ')}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 font-medium text-[10px] text-emerald-400">
                          <CheckCircle2 className="size-2.5" />
                          <span>Na sua biblioteca</span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Card de Convite para Avaliação */}
            <div className="space-y-1.5 rounded-2xl border border-white/[0.04] bg-neutral-900/60 p-5 text-center shadow-sm backdrop-blur-sm sm:p-6">
              <p className="font-medium text-neutral-200 text-sm">
                Compartilhe sua opinião sobre o que jogou recentemente! 🎮
              </p>
              <div>
                <Link
                  href="/games"
                  className="inline-flex items-center gap-1 text-neutral-400 text-xs underline-offset-4 transition-colors hover:text-white hover:underline"
                >
                  <span>Explorar os jogos mais aclamados e avaliar</span>
                  <ChevronRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Avaliações Populares */}
            <div className="space-y-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-neutral-400" />
                  <h2 className="font-bold font-redaction text-base text-white sm:text-xl">
                    Avaliações populares
                  </h2>
                </div>

                {/* Period Filter Tabs */}
                <div className="flex w-fit items-center gap-1 rounded-full border border-white/[0.04] bg-neutral-900/80 p-1">
                  {PERIOD_TABS.map((tab) => {
                    const isActive = selectedPeriod === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedPeriod(tab.id)}
                        className={`select-none rounded-full px-3 py-1 text-xs transition-all ${
                          isActive
                            ? 'bg-white/[0.12] font-semibold text-white shadow-sm'
                            : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviews Feed List */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-3">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="space-y-3 rounded-2xl border border-white/[0.03] bg-neutral-900/40 p-4 transition-colors hover:bg-neutral-900/60 sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-bold text-neutral-300 text-xs">
                            {review.user?.avatarUrl ? (
                              <img
                                src={review.user.avatarUrl}
                                alt={review.user.username}
                                className="size-full object-cover"
                              />
                            ) : (
                              (review.user?.displayName ||
                                review.user?.username ||
                                'U')[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-white text-xs">
                              {review.user?.displayName || review.user?.username}
                            </span>
                            <span className="ml-1.5 text-[11px] text-neutral-400">
                              @{review.user?.username}
                            </span>
                          </div>
                        </div>

                        {/* Rating Stars Badge */}
                        <div className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-amber-400 text-xs">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Game Context & Review Content */}
                      <div>
                        <Link
                          href={`/games/${review.gameSlug}`}
                          className="font-semibold text-neutral-300 text-xs transition-colors hover:text-white"
                        >
                          {review.gameTitle}
                        </Link>
                        {review.reviewText && (
                          <p className="mt-1 line-clamp-3 text-neutral-300 text-xs leading-relaxed">
                            {review.reviewText}
                          </p>
                        )}
                      </div>

                      {/* Footer: platform & hours */}
                      {(review.platform || review.hoursPlayed) && (
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-neutral-400">
                          {review.platform && <span>{review.platform}</span>}
                          {review.hoursPlayed && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {review.hoursPlayed}h jogadas
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Sleek Empty State for Reviews */
                <div className="space-y-2.5 rounded-2xl border border-white/[0.04] bg-neutral-900/30 p-8 text-center">
                  <Gamepad2 className="mx-auto size-8 text-neutral-600" />
                  <p className="text-neutral-400 text-xs">
                    Ainda não há avaliações comunitárias gravadas neste período.
                  </p>
                  <Link
                    href="/games"
                    className="inline-flex items-center gap-1.5 pt-1 font-medium text-white text-xs hover:underline"
                  >
                    <span>Explorar catálogo para avaliar</span>
                    <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Atividade da sua rede */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-neutral-400" />
                <h2 className="font-bold font-redaction text-base text-white sm:text-xl">
                  Atividade da sua rede
                </h2>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-2.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.03] bg-neutral-900/40 p-3.5 text-neutral-300 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-bold text-[10px]">
                          {act.user?.avatarUrl ? (
                            <img
                              src={act.user.avatarUrl}
                              alt={act.user.username}
                              className="size-full object-cover"
                            />
                          ) : (
                            (act.user?.displayName || act.user?.username || 'U')[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-white">
                            {act.user?.displayName || act.user?.username}
                          </span>{' '}
                          <span className="text-neutral-400">
                            {act.type === 'played'
                              ? 'jogou'
                              : act.type === 'reviewed'
                                ? 'avaliou'
                                : 'adicionou à lista'}
                          </span>{' '}
                          <Link
                            href={`/games/${act.gameSlug}`}
                            className="font-medium text-white hover:underline"
                          >
                            {act.gameSlug}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 rounded-2xl border border-white/[0.04] bg-neutral-900/30 p-6 text-center">
                  <p className="text-neutral-400 text-xs">
                    Nenhuma atividade recente encontrada na sua rede.
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Conecte sua conta Steam ou avalie títulos para compartilhar seu progresso com
                    outros jogadores.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Sidebar (4 cols on lg) */}
          <aside className="space-y-7 lg:col-span-4">
            {/* Jogos Populares */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-neutral-400" />
                  <h2 className="font-bold font-redaction text-sm text-white sm:text-base">
                    Jogos Populares
                  </h2>
                </div>
                <Link
                  href="/games?tab=populares"
                  className="text-neutral-400 text-xs transition-colors hover:text-white"
                >
                  Ver todos
                </Link>
              </div>

              {/* Row of 3 poster cards with Skeletons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {popularGames.map((game) => (
                  <Link
                    key={game.id || game.slug}
                    href={`/games/${game.slug}`}
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.05] bg-neutral-900 shadow-md transition-all hover:scale-[1.02] hover:border-white/20"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />

                    {/* Dark gradient at bottom */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="line-clamp-1 font-semibold text-[10px] text-white">
                        {game.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mais Bem Avaliados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="size-4 text-amber-400" />
                  <h2 className="font-bold font-redaction text-sm text-white sm:text-base">
                    Mais Bem Avaliados
                  </h2>
                </div>
                <Link
                  href="/games?tab=bem-avaliados"
                  className="text-neutral-400 text-xs transition-colors hover:text-white"
                >
                  Ver todos
                </Link>
              </div>

              {/* Row of 3 poster cards with Skeletons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {topRatedGames.map((game) => (
                  <Link
                    key={game.id || game.slug}
                    href={`/games/${game.slug}`}
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.05] bg-neutral-900 shadow-md transition-all hover:scale-[1.02] hover:border-white/20"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />

                    {/* Rating badge */}
                    {game.rating && (
                      <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 rounded-md border border-amber-400/20 bg-black/85 px-1.5 py-0.5 backdrop-blur-sm">
                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-[10px] text-white">
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Dark gradient at bottom */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="line-clamp-1 font-semibold text-[10px] text-white">
                        {game.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Em Breve / Mais Aguardados */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="size-4 text-orange-400" />
                  <h2 className="font-bold font-redaction text-sm text-white sm:text-base">
                    Mais Aguardados
                  </h2>
                </div>
                <Link
                  href="/games?tab=lancamentos"
                  className="text-neutral-400 text-xs transition-colors hover:text-white"
                >
                  Ver todos
                </Link>
              </div>

              {/* Row of 3 poster cards with Skeletons */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                {upcomingGames.map((game) => (
                  <Link
                    key={game.id || game.slug}
                    href={`/games/${game.slug}`}
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.05] bg-neutral-900 shadow-md transition-all hover:scale-[1.02] hover:border-white/20"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />

                    {/* Steam Awaited / Release year badge */}
                    <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 rounded-md border border-amber-400/20 bg-black/85 px-1.5 py-0.5 backdrop-blur-sm">
                      <Sparkles className="size-2.5 text-amber-400" />
                      <span className="font-bold text-[9px] text-amber-300">
                        {game.isSteamAwaited ? 'Steam' : game.releaseYear || '2025'}
                      </span>
                    </div>

                    {/* Dark gradient at bottom */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="line-clamp-1 font-semibold text-[10px] text-white">
                        {game.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
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
