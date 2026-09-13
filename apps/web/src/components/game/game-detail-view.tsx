'use client';

import { BarChart3, CalendarDays, Gamepad2, Star, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { TopNav } from '@/components/navigation/top-nav';
import { useAuth } from '@/hooks/use-auth';
import type { Game, GameActivity, GameReview } from '@/lib/games';
import { authHref } from '@/lib/navigation';
import { GameAchievementsTab } from './game-achievements-tab';
import { GameActivitySection } from './game-activity-section';
import { GameHero } from './game-hero';
import { GameReviewModal } from './game-review-modal';
import { GameReviewsSection } from './game-reviews-section';
import { GameSimilarTab } from './game-similar-tab';
import { GameDetailsTab, GameGalleryTab } from './game-summary';

interface GameDetailViewProps {
  game: Game;
  initialReviews: GameReview[];
  initialActivities: GameActivity[];
  similarGames?: Game[];
  recommendedGames?: Game[];
}

type TabType = 'reviews' | 'achievements' | 'similar' | 'activity' | 'gallery' | 'details';

export function GameDetailView({
  game,
  initialReviews,
  initialActivities,
  similarGames = []
}: GameDetailViewProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<GameReview | null>(null);
  const [reviews, setReviews] = useState<GameReview[]>(initialReviews);
  const [activities, setActivities] = useState<GameActivity[]>(initialActivities);
  const [selectedBannerUrl, setSelectedBannerUrl] = useState<string | null>(game.bannerUrl || null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`admin_banner_${game.slug}`);
      if (saved) {
        setSelectedBannerUrl(saved);
      }

      const storedReviews = localStorage.getItem(`local_reviews_${game.slug}`);
      if (storedReviews) {
        try {
          const parsed = JSON.parse(storedReviews);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const uniqueNew = parsed.filter((r) => !existingIds.has(r.id));
              return [...uniqueNew, ...prev];
            });
          }
        } catch {}
      }
    }
  }, [game.slug]);

  // Find user's own review
  const userReview = useMemo(() => {
    if (!currentUser) return null;
    return reviews.find(
      (r) => r.userId === currentUser.id || r.user?.username === currentUser.username
    );
  }, [reviews, currentUser]);

  // Compute community rating score
  const communityRating = useMemo(() => {
    if (reviews.length === 0) return { average: '—', count: 0 };
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: (total / reviews.length).toFixed(1),
      count: reviews.length
    };
  }, [reviews]);

  const handleOpenReview = () => {
    if (!currentUser) {
      toast.info('Você precisa entrar ou criar uma conta para avaliar jogos.');
      router.push(authHref(`/games/${game.slug}`));
      return;
    }
    setEditingReview(userReview || null);
    setIsReviewModalOpen(true);
  };

  const handleEditReview = (review: GameReview) => {
    if (!currentUser) {
      toast.info('Você precisa entrar ou criar uma conta para avaliar jogos.');
      router.push(authHref(`/games/${game.slug}`));
      return;
    }
    setEditingReview(review);
    setIsReviewModalOpen(true);
  };

  const handleReviewCreated = (savedReview: GameReview) => {
    setReviews((prev) => {
      const exists = prev.some((r) => r.id === savedReview.id);
      if (exists) {
        return prev.map((r) => (r.id === savedReview.id ? savedReview : r));
      }
      return [savedReview, ...prev];
    });

    const newActivity: GameActivity = {
      id: `act-${Date.now()}`,
      gameId: savedReview.gameId,
      gameSlug: savedReview.gameSlug,
      gameTitle: savedReview.gameTitle,
      userId: savedReview.userId,
      user: savedReview.user,
      type: 'rated',
      detail: savedReview.reviewText
        ? `avaliou com ${savedReview.rating} estrelas: "${savedReview.reviewText.substring(0, 60)}..."`
        : `avaliou com ${savedReview.rating} estrelas`,
      platform: savedReview.platform,
      createdAt: savedReview.createdAt
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const mediaCount = (game.artworks?.length || 0) + (game.screenshots?.length || 0);

  const similarList = similarGames?.length ? similarGames : game.similarGames || [];

  const TABS: { id: TabType; label: string; count?: number }[] = [
    { id: 'reviews', label: 'Avaliações', count: reviews.length },
    { id: 'achievements', label: 'Conquistas', count: 42 },
    {
      id: 'similar',
      label: 'Similares',
      count: similarList.length > 0 ? similarList.length : undefined
    },
    { id: 'activity', label: 'Atividade', count: activities.length },
    { id: 'gallery', label: 'Galeria', count: mediaCount > 0 ? mediaCount : undefined },
    { id: 'details', label: 'Ficha Técnica' }
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-neutral-100 selection:bg-white/20">
      <TopNav />

      {/* Hero Section */}
      <GameHero
        game={game}
        onOpenReviewModal={handleOpenReview}
        bannerUrl={selectedBannerUrl}
        communityRating={communityRating}
        userReview={userReview}
      />

      <GameProfileSnapshot game={game} reviews={reviews} />

      {/* Main Tabs Container */}
      <main className="mx-auto max-w-5xl space-y-6 px-3 pt-5 pb-16 sm:space-y-8 sm:px-6 sm:pt-8 sm:pb-24">
        {/* Scrollable on narrow screens so every destination remains reachable. */}
        <div className="-mx-3 flex items-center justify-start overflow-x-auto px-3 pb-1 sm:mx-0 sm:justify-center sm:px-0 sm:pb-2">
          <nav className="inline-flex min-w-max items-center justify-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-1.5 backdrop-blur-xl">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex cursor-pointer select-none items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-medium text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                    isActive
                      ? 'font-semibold text-black'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="game-tab-liquid-pill"
                      className="absolute inset-0 rounded-xl bg-white shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
                      transition={{
                        type: 'spring',
                        duration: 0.24,
                        bounce: 0
                      }}
                    />
                  )}
                  <span className="relative z-10 tracking-tight">{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`relative z-10 rounded-full px-1.5 py-0.2 font-bold font-mono text-[10px] transition-colors ${
                        isActive ? 'bg-black text-white' : 'bg-white/[0.08] text-neutral-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            >
              <GameReviewsSection
                game={game}
                initialReviews={reviews}
                onOpenReviewModal={handleOpenReview}
                onEditReview={handleEditReview}
              />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            >
              <GameAchievementsTab game={game} />
            </motion.div>
          )}

          {activeTab === 'similar' && (
            <motion.div
              key="similar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            >
              <GameSimilarTab currentGame={game} similarGames={similarList} />
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            >
              <GameActivitySection activities={activities} />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            >
              <GameGalleryTab
                game={game}
                onSelectBanner={setSelectedBannerUrl}
                activeBannerUrl={selectedBannerUrl}
              />
            </motion.div>
          )}

          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
            >
              <GameDetailsTab game={game} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dedicated Review Pop-up Modal with Edit & Delete support */}
      <GameReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setEditingReview(null);
        }}
        game={game}
        initialReview={editingReview}
        onReviewCreated={handleReviewCreated}
        onReviewDeleted={handleReviewDeleted}
      />
    </div>
  );
}

function GameProfileSnapshot({ game, reviews }: { game: Game; reviews: GameReview[] }) {
  const ratingTotal = reviews.reduce((total, review) => total + review.rating, 0);
  const average = reviews.length > 0 ? ratingTotal / reviews.length : 0;
  const ratingBuckets = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => Math.round(review.rating) === rating).length
  }));

  return (
    <section className="mx-auto max-w-5xl px-4 pt-6 sm:px-6" aria-label="Resumo do jogo">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Community Rating Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4.5 backdrop-blur-md transition-all hover:border-white/15 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-medium text-[11px] uppercase tracking-wider">
              Nota da comunidade
            </span>
            <Star className="size-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-bold font-mono text-3xl text-white tracking-tight sm:text-4xl">
              {reviews.length ? average.toFixed(1) : '—'}
            </span>
            <span className="pb-1 text-neutral-500 text-xs tracking-tight">
              {reviews.length
                ? `${reviews.length} ${reviews.length === 1 ? 'avaliação' : 'avaliações'}`
                : 'seja o primeiro'}
            </span>
          </div>
        </div>

        {/* Rating Breakdown Histogram */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4.5 backdrop-blur-md transition-all hover:border-white/15 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-medium text-[11px] uppercase tracking-wider">Distribuição</span>
            <BarChart3 className="size-4 text-neutral-400" />
          </div>
          <div className="mt-3 space-y-1.5">
            {ratingBuckets.map(({ rating, count }) => (
              <div
                key={rating}
                className="flex items-center gap-2 font-mono text-[10px] text-neutral-500"
              >
                <span className="w-3 text-neutral-400">{rating}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-amber-400/90 transition-all duration-300"
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-4 text-right text-neutral-400">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Release & Developer Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4.5 backdrop-blur-md transition-all hover:border-white/15 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-medium text-[11px] uppercase tracking-wider">Lançamento</span>
            <CalendarDays className="size-4 text-neutral-400" />
          </div>
          <p className="mt-3 font-bold font-mono text-white text-xl sm:text-2xl">
            {game.releaseYear ||
              (game.firstReleaseDate
                ? new Date(game.firstReleaseDate).getFullYear()
                : 'A anunciar')}
          </p>
          <p className="mt-1 truncate font-medium text-neutral-400 text-xs tracking-tight">
            {game.developer || 'Estúdio independente'}
          </p>
        </div>

        {/* Platforms & Community Activity */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4.5 backdrop-blur-md transition-all hover:border-white/15 sm:p-5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="font-medium text-[11px] uppercase tracking-wider">
              Disponibilidade
            </span>
            <Gamepad2 className="size-4 text-neutral-400" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(game.platforms?.length ? game.platforms : ['Multiplataforma'])
              .slice(0, 3)
              .map((platform) => (
                <span
                  key={platform}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 font-medium text-[10px] text-neutral-300 tracking-tight"
                >
                  {platform}
                </span>
              ))}
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-neutral-500">
            <Users className="size-3 text-neutral-400" /> Veja o que a comunidade está jogando
          </p>
        </div>
      </div>
    </section>
  );
}
