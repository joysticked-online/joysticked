'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { TopNav } from '@/components/navigation/top-nav';
import { useAuth } from '@/hooks/use-auth';
import type { Game, GameActivity, GameReview } from '@/lib/games';
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
  similarGames = [],
  recommendedGames = []
}: GameDetailViewProps) {
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
    if (reviews.length === 0) return { average: '5.0', count: 0 };
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: (total / reviews.length).toFixed(1),
      count: reviews.length
    };
  }, [reviews]);

  const handleOpenReview = () => {
    setEditingReview(userReview || null);
    setIsReviewModalOpen(true);
  };

  const handleEditReview = (review: GameReview) => {
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-white/20">
      <TopNav />

      {/* Hero Section */}
      <GameHero
        game={game}
        onOpenReviewModal={handleOpenReview}
        bannerUrl={selectedBannerUrl}
        communityRating={communityRating}
        userReview={userReview}
      />

      {/* Main Tabs Container */}
      <main className="mx-auto max-w-5xl space-y-8 px-4 pt-8 pb-24 sm:px-6">
        {/* Centered Liquid Tab Bar */}
        <div className="flex items-center justify-center pb-2">
          <nav className="inline-flex items-center justify-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-1.5 backdrop-blur-md">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex cursor-pointer select-none items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
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
                        stiffness: 420,
                        damping: 30
                      }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`relative z-10 rounded-full px-1.5 py-0.2 font-bold text-[10px] transition-colors ${
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
              transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
            >
              <GameActivitySection game={game} activities={activities} />
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
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
              transition={{ duration: 0.15 }}
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
