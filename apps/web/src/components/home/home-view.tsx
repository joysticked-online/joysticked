'use client';

import {
  ChevronRight,
  Clock,
  Edit3,
  Gamepad2,
  MessageSquare,
  Monitor,
  Play,
  Smartphone,
  Star,
  ThumbsUp,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { GameReviewModal } from '@/components/game/game-review-modal';
import { PixelHeart } from '@/components/landing/pixel-heart';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { PosterImage } from '@/components/ui/poster-image';
import { useAuth } from '@/hooks/use-auth';
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
    summary:
      'Reúna seu grupo e retorne aos Reinos Esquecidos em um conto de companheirismo e traição, sacrifício e sobrevivência.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    rating: 4.9
  },
  {
    id: 1942,
    name: 'The Witcher 3: Wild Hunt',
    slug: 'the-witcher-3-wild-hunt',
    summary:
      'Torne-se um caçador de monstros profissional em busca da criança da profecia em um vasto mundo aberto.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
    rating: 4.9
  },
  {
    id: 1192,
    name: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    summary:
      'A história do fora da lei Arthur Morgan e da notória gangue Van der Linde no fim da era do Velho Oeste.',
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
  { id: 'all', label: 'Todos os tempos' }
] as const;

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function getPlatformIcon(platform?: string | null) {
  if (!platform) return null;
  const lower = platform.toLowerCase();
  if (
    lower.includes('pc') ||
    lower.includes('windows') ||
    lower.includes('mac') ||
    lower.includes('linux') ||
    lower.includes('steam')
  ) {
    return <Monitor className="size-3.5 text-neutral-400" />;
  }
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) {
    return <Smartphone className="size-3.5 text-neutral-400" />;
  }
  return <Gamepad2 className="size-3.5 text-neutral-400" />;
}

function RatingHearts({ rating, size = 14 }: { rating: number; size?: number }) {
  const normalized = rating > 5 ? rating / 2 : rating;
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const heartNum = i + 1;
        const isFull = normalized >= heartNum;
        const isHalf = !isFull && normalized >= heartNum - 0.5;
        const variant = isFull ? 'full' : isHalf ? 'half' : 'empty';
        return (
          <PixelHeart key={i} size={size} variant={variant} color="#FFFFFF" emptyColor="#333333" />
        );
      })}
    </div>
  );
}

interface HomeViewProps {
  initialData?: HomeFeedData | null;
}

export function HomeView({ initialData }: HomeViewProps) {
  const { user: currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [recentPlayedSlugs, setRecentPlayedSlugs] = useState<string[]>([]);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [spoilersRevealed, setSpoilersRevealed] = useState<Record<string, boolean>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [modalGame, setModalGame] = useState<Game | null>(null);

  // Load client's recently played / reviewed games from localStorage
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

  // Real reviews only (no mocked reviews)
  const reviews: GameReview[] = initialData?.popularReviews || [];
  const activities: GameActivity[] = initialData?.activities || [];

  const filteredReviews = reviews.filter((review) => {
    if (selectedPeriod === 'all') return true;

    const createdAt = new Date(review.createdAt);
    if (Number.isNaN(createdAt.getTime())) return true;

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

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => {
      const isLiked = !prev[reviewId];
      if (isLiked) {
        toast.success('Avaliação curtida.');
      }
      return { ...prev, [reviewId]: isLiked };
    });
  };

  const toggleSpoiler = (reviewId: string) => {
    setSpoilersRevealed((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const handleOpenReview = (game: Game) => {
    setModalGame(game);
    setIsReviewModalOpen(true);
  };

  const spotlightGame = topRatedGames[0] || popularGames[0];

  return (
    <div className="flex min-h-screen flex-col bg-[#08080a] font-sans text-neutral-100 selection:bg-white/20 selection:text-white">
      {/* Centralized Floating Top Navigation */}
      <TopNav />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-20 pb-24 sm:px-6 sm:pt-24 md:px-8">
        {/* Page Header & Minimalist Quick Navigation Bar */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] text-neutral-400">
                <span className="size-1.5 rounded-full bg-white/60" />
                <span>
                  {currentUser
                    ? `Olá, ${currentUser.displayName || currentUser.username}`
                    : 'Joysticked'}
                </span>
              </div>
              <h1 className="mt-2.5 font-bold text-3xl text-white tracking-tight [text-wrap:balance] sm:text-4xl md:text-5xl">
                O que você vai jogar hoje?
              </h1>
              <p className="mt-2 max-w-xl text-neutral-400 text-sm leading-relaxed sm:text-base">
                Acompanhe o catálogo, registre suas avaliações e explore recomendações da
                comunidade.
              </p>
            </div>

            {/* Quick Navigation Chips in Monochrome */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/games?tab=descobrir"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-medium text-neutral-300 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <span>Descobrir</span>
              </Link>
              <Link
                href="/games?tab=populares"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-medium text-neutral-300 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <span>Populares</span>
              </Link>
              <Link
                href="/games?tab=bem-avaliados"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-medium text-neutral-300 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
              >
                <span>Mais Bem Avaliados</span>
              </Link>
            </div>
          </div>
        </header>

        {/* 2-Column Responsive Dashboard Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT COLUMN: Main Feed (8 cols on lg) */}
          <section className="space-y-7 lg:col-span-8">
            {/* Spotlight: Destaque da Comunidade */}
            {spotlightGame && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/40 p-6 backdrop-blur-md sm:p-7"
              >
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  {/* Spotlight Poster */}
                  <Link
                    href={`/games/${spotlightGame.slug}`}
                    className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-xl transition-transform duration-200 hover:scale-[1.02] sm:w-28"
                  >
                    <PosterImage
                      src={spotlightGame.coverUrl}
                      alt={spotlightGame.name}
                      priority
                      sizes="120px"
                    />
                  </Link>

                  {/* Spotlight Info */}
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-medium text-[11px] text-neutral-300">
                      <span>Destaque da Comunidade</span>
                    </div>

                    <h2 className="font-bold text-white text-xl leading-snug tracking-tight [text-wrap:balance] sm:text-2xl">
                      <Link
                        href={`/games/${spotlightGame.slug}`}
                        className="transition-colors hover:text-neutral-300"
                      >
                        {spotlightGame.name}
                      </Link>
                    </h2>

                    {spotlightGame.summary && (
                      <p className="line-clamp-2 text-neutral-400 text-xs leading-relaxed [text-wrap:pretty]">
                        {spotlightGame.summary}
                      </p>
                    )}

                    {/* Rating & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {spotlightGame.rating && (
                        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1">
                          <RatingHearts rating={spotlightGame.rating} size={13} />
                          <span className="font-bold text-white text-xs tabular-nums">
                            {spotlightGame.rating > 5
                              ? (spotlightGame.rating / 2).toFixed(1)
                              : spotlightGame.rating.toFixed(1)}
                          </span>
                        </div>
                      )}

                      <Link
                        href={`/games/${spotlightGame.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 font-semibold text-black text-xs transition-all hover:bg-neutral-200 active:scale-95"
                      >
                        <span>Ver Ficha</span>
                        <ChevronRight className="size-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenReview(spotlightGame)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-medium text-neutral-300 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
                      >
                        <Edit3 className="size-3.5" />
                        <span>Avaliar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* "Continue de onde parou" / Backlog Recente */}
            {recentPlayedSlugs.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="size-3.5 text-neutral-400" />
                    <h2 className="font-bold text-base text-white tracking-tight sm:text-lg">
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
                      className="group flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-neutral-900/40 p-2.5 transition-all hover:border-white/20 hover:bg-neutral-900 active:scale-[0.98]"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-white transition-transform group-hover:scale-105">
                        <Gamepad2 className="size-4 text-neutral-400 transition-colors group-hover:text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-white text-xs capitalize transition-colors group-hover:text-neutral-200">
                          {slug.replace(/-/g, ' ')}
                        </span>
                        <span className="mt-0.5 block text-[10px] text-neutral-400">
                          Na sua biblioteca
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Avaliações da Comunidade */}
            <div className="space-y-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-neutral-400" />
                  <h2 className="font-bold text-base text-white tracking-tight sm:text-lg">
                    Avaliações da Comunidade
                  </h2>
                </div>

                {/* Period Filter Tabs with Apple Spring Motion */}
                <div className="flex w-fit items-center gap-1 rounded-full border border-white/[0.06] bg-neutral-900/60 p-1">
                  {PERIOD_TABS.map((tab) => {
                    const isActive = selectedPeriod === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedPeriod(tab.id)}
                        className={`relative select-none rounded-full px-3 py-1 font-medium text-xs transition-colors ${
                          isActive ? 'text-white' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="active-period-indicator"
                            className="absolute inset-0 rounded-full bg-white/[0.12] shadow-sm"
                            transition={{ type: 'spring', duration: 0.24, bounce: 0 }}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reviews Feed List */}
              {filteredReviews.length > 0 ? (
                <div className="space-y-3">
                  {filteredReviews.map((review) => {
                    const isLiked = likedReviews[review.id];
                    const isSpoilerRevealed = spoilersRevealed[review.id];
                    const hasHiddenSpoiler = Boolean(review.containsSpoiler && !isSpoilerRevealed);
                    const timeAgo = formatRelativeTime(review.createdAt);

                    return (
                      <div
                        key={review.id}
                        className="group space-y-3.5 rounded-xl border border-white/[0.06] bg-neutral-900/40 p-4.5 transition-all duration-200 hover:border-white/15 hover:bg-neutral-900/60 sm:p-5"
                      >
                        {/* Header: User Info & Score */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Link
                              href={`/${review.user?.username || ''}`}
                              className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-neutral-800 font-bold text-neutral-300 text-xs transition-transform hover:scale-105"
                            >
                              {review.user?.avatarUrl ? (
                                <Image
                                  src={review.user.avatarUrl}
                                  alt={review.user.username}
                                  width={32}
                                  height={32}
                                  unoptimized
                                  className="size-full object-cover"
                                />
                              ) : (
                                (review.user?.displayName ||
                                  review.user?.username ||
                                  'U')[0].toUpperCase()
                              )}
                            </Link>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/${review.user?.username || ''}`}
                                  className="font-semibold text-white text-xs hover:underline"
                                >
                                  {review.user?.displayName || review.user?.username}
                                </Link>
                                <span className="text-[11px] text-neutral-400">
                                  @{review.user?.username}
                                </span>
                              </div>
                              {timeAgo && (
                                <span className="font-normal text-[10.5px] text-neutral-400 tabular-nums">
                                  {timeAgo}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Rating Display */}
                          <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/40 px-2.5 py-1">
                            <RatingHearts rating={review.rating} size={13} />
                            <span className="font-bold text-white text-xs tabular-nums">
                              {review.rating > 5
                                ? (review.rating / 2).toFixed(1)
                                : review.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {/* Game Context & Review Content */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-neutral-400">avaliou</span>
                            <Link
                              href={`/games/${review.gameSlug}`}
                              className="font-bold text-white text-xs transition-colors hover:underline"
                            >
                              {review.gameTitle}
                            </Link>
                          </div>

                          {review.reviewText && (
                            <div className="relative">
                              {hasHiddenSpoiler ? (
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3 text-neutral-300 text-xs">
                                  <span>Esta avaliação contém spoilers do enredo.</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleSpoiler(review.id)}
                                    className="font-semibold text-white underline hover:text-neutral-300"
                                  >
                                    Ver conteúdo
                                  </button>
                                </div>
                              ) : (
                                <p className="text-neutral-300 text-xs leading-relaxed [text-wrap:pretty]">
                                  {review.reviewText}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Footer: platform & hours & like */}
                        <div className="flex items-center justify-between border-white/[0.04] border-t pt-3 text-[11px] text-neutral-400">
                          <div className="flex items-center gap-3">
                            {review.platform && (
                              <div className="flex items-center gap-1">
                                {getPlatformIcon(review.platform)}
                                <span>{review.platform}</span>
                              </div>
                            )}
                            {review.hoursPlayed && (
                              <span className="flex items-center gap-1 tabular-nums">
                                <Clock className="size-3" />
                                {review.hoursPlayed}h jogadas
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleLike(review.id)}
                            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors active:scale-95 ${
                              isLiked
                                ? 'bg-white/10 font-semibold text-white'
                                : 'text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200'
                            }`}
                          >
                            <ThumbsUp
                              className={`size-3 ${isLiked ? 'fill-white text-white' : ''}`}
                            />
                            <span className="tabular-nums">
                              {(review.likesCount || 0) + (isLiked ? 1 : 0)}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Sleek Empty State for Reviews */
                <div className="space-y-3 rounded-xl border border-white/[0.06] bg-neutral-900/30 p-8 text-center backdrop-blur-sm">
                  <Gamepad2 className="mx-auto size-7 text-neutral-600" />
                  <p className="font-medium text-neutral-300 text-sm">
                    Nenhuma avaliação comunitária registrada neste período.
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Compartilhe sua opinião sobre um jogo do catálogo.
                  </p>
                  <div>
                    <Link
                      href="/games"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 font-medium text-white text-xs transition-all hover:bg-white/[0.1] active:scale-95"
                    >
                      <span>Explorar Catálogo de Jogos</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Atividade da sua rede */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-neutral-400" />
                <h2 className="font-bold text-base text-white tracking-tight sm:text-lg">
                  Atividade da sua rede
                </h2>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-2.5">
                  {activities.map((act) => {
                    const timeAgo = formatRelativeTime(act.createdAt);
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-neutral-900/30 p-3.5 text-neutral-300 text-xs transition-colors hover:border-white/[0.08] hover:bg-neutral-900/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <Link
                            href={`/${act.user?.username || ''}`}
                            className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 font-bold text-[10px] text-neutral-300"
                          >
                            {act.user?.avatarUrl ? (
                              <Image
                                src={act.user.avatarUrl}
                                alt={act.user.username}
                                width={28}
                                height={28}
                                unoptimized
                                className="size-full object-cover"
                              />
                            ) : (
                              (act.user?.displayName || act.user?.username || 'U')[0].toUpperCase()
                            )}
                          </Link>
                          <div>
                            <Link
                              href={`/${act.user?.username || ''}`}
                              className="font-semibold text-white hover:underline"
                            >
                              {act.user?.displayName || act.user?.username}
                            </Link>{' '}
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
                              {act.gameTitle || act.gameSlug}
                            </Link>
                          </div>
                        </div>

                        {timeAgo && (
                          <span className="shrink-0 text-[10.5px] text-neutral-400 tabular-nums">
                            {timeAgo}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5 rounded-xl border border-white/[0.04] bg-neutral-900/30 p-6 text-center">
                  <p className="font-medium text-neutral-300 text-xs">
                    Nenhuma atividade recente encontrada na sua rede.
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Conecte sua conta Steam ou avalie títulos para compartilhar seu progresso.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Discovery Sidebar (4 cols on lg) */}
          <aside className="space-y-7 lg:col-span-4">
            {/* Jogos Populares */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-neutral-400" />
                  <h2 className="font-bold text-sm text-white tracking-tight sm:text-base">
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
                {popularGames.map((game, idx) => (
                  <Link
                    key={game.id || game.slug}
                    href={`/games/${game.slug}`}
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-900 shadow-md transition-all duration-200 hover:scale-[1.03] hover:border-white/20 active:scale-[0.98]"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />

                    {/* Rank Badge */}
                    <div className="absolute top-1.5 left-1.5 z-10 flex size-5 items-center justify-center rounded-md bg-black/80 font-bold text-[10px] text-white tabular-nums backdrop-blur-sm">
                      #{idx + 1}
                    </div>

                    {/* Dark gradient on hover with title */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="line-clamp-2 font-semibold text-[10px] text-white leading-tight">
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
                  <Star className="size-4 text-neutral-400" />
                  <h2 className="font-bold text-sm text-white tracking-tight sm:text-base">
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
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-900 shadow-md transition-all duration-200 hover:scale-[1.03] hover:border-white/20 active:scale-[0.98]"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />

                    {/* Rating badge */}
                    {game.rating && (
                      <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 rounded-md border border-white/10 bg-black/85 px-1.5 py-0.5 backdrop-blur-sm">
                        <PixelHeart size={10} variant="full" color="#FFFFFF" />
                        <span className="font-bold text-[10px] text-white tabular-nums">
                          {game.rating > 5 ? (game.rating / 2).toFixed(1) : game.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Dark gradient on hover */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="line-clamp-2 font-semibold text-[10px] text-white leading-tight">
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
                  <Clock className="size-4 text-neutral-400" />
                  <h2 className="font-bold text-sm text-white tracking-tight sm:text-base">
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
                    className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-900 shadow-md transition-all duration-200 hover:scale-[1.03] hover:border-white/20 active:scale-[0.98]"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />

                    {/* Steam Awaited / Release year badge */}
                    <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1 rounded-md border border-white/10 bg-black/85 px-1.5 py-0.5 backdrop-blur-sm">
                      <span className="font-semibold text-[9px] text-neutral-300">
                        {game.isSteamAwaited ? 'Steam' : game.releaseYear || '2025'}
                      </span>
                    </div>

                    {/* Dark gradient on hover */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <span className="line-clamp-2 font-semibold text-[10px] text-white leading-tight">
                        {game.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Joysticked Feature Box: Steam Sync & Backlog */}
            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-neutral-900/40 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-white/10">
                  <Gamepad2 className="size-4 text-white" />
                </div>
                <h3 className="font-bold text-sm text-white tracking-tight">
                  Sincronize sua Biblioteca
                </h3>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Conecte seu perfil da Steam para importar horas de jogo, conquistas e organizar seu
                backlog automaticamente.
              </p>
              <Link
                href="/settings"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] py-2 font-semibold text-white text-xs transition-colors hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <span>Conectar Contas</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Micro-Pill (Bottom Right) */}
      <div className="fixed right-5 bottom-5 z-40">
        <Link
          href="/pro"
          className="group flex select-none items-center gap-2 rounded-full border border-white/[0.08] bg-[#08080a]/95 px-3.5 py-1.5 text-neutral-300 text-xs shadow-2xl backdrop-blur-md transition-all hover:border-white/20 hover:text-white active:scale-95"
        >
          <span className="font-medium text-[11.5px] sm:text-xs">Experimente o plano PRO</span>
          <span className="rounded-full bg-white px-1.5 py-0.2 font-extrabold text-[9px] text-black uppercase tracking-wider">
            PRO
          </span>
        </Link>
      </div>

      {/* Interactive Game Review Modal */}
      {modalGame && (
        <GameReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          game={modalGame}
          onReviewCreated={() => {
            setIsReviewModalOpen(false);
            toast.success('Avaliação publicada com sucesso!');
          }}
        />
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
