'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Activity,
  Gamepad2,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { TopNav } from '@/components/navigation/top-nav';
import { GameHero } from './game-hero';
import { GameReviewsSection } from './game-reviews-section';
import { GamePlatforms } from './game-platforms';
import { GameActivitySection } from './game-activity-section';
import { GameGalleryTab, GameDetailsTab } from './game-summary';
import { GameAchievementsTab } from './game-achievements-tab';
import { ADMIN_GAME_BANNERS } from '@/constants/admin-banners';
import type { Game, GameReview, GameActivity } from '@/lib/games';

interface GameDetailViewProps {
  game: Game;
  initialReviews: GameReview[];
  initialActivities: GameActivity[];
}

type TabType = 'reviews' | 'achievements' | 'platforms' | 'activity' | 'gallery' | 'details';

export function GameDetailView({
  game,
  initialReviews,
  initialActivities
}: GameDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState<GameReview[]>(initialReviews);
  const [activities, setActivities] = useState<GameActivity[]>(initialActivities);
  const [selectedBannerUrl, setSelectedBannerUrl] = useState<string | null>(
    ADMIN_GAME_BANNERS[game.slug] || game.bannerUrl || null
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`admin_banner_${game.slug}`);
      if (saved) {
        setSelectedBannerUrl(saved);
      }
    }
  }, [game.slug]);

  const handleOpenReview = () => {
    setActiveTab('reviews');
    setIsReviewModalOpen(true);
  };

  const handleReviewCreated = (newReview: GameReview) => {
    setReviews((prev) => [newReview, ...prev]);
    const newActivity: GameActivity = {
      id: `act-${Date.now()}`,
      gameId: newReview.gameId,
      gameSlug: newReview.gameSlug,
      gameTitle: newReview.gameTitle,
      userId: newReview.userId,
      user: newReview.user,
      type: 'rated',
      detail: newReview.reviewText
        ? `avaliou com ${newReview.rating} estrelas: "${newReview.reviewText.substring(0, 60)}..."`
        : `avaliou com ${newReview.rating} estrelas`,
      platform: newReview.platform,
      createdAt: newReview.createdAt
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const mediaCount = (game.artworks?.length || 0) + (game.screenshots?.length || 0);

  const TABS: { id: TabType; label: string; count?: number }[] = [
    { id: 'reviews', label: 'Avaliações', count: reviews.length },
    { id: 'achievements', label: 'Conquistas', count: 42 },
    { id: 'platforms', label: 'Onde Jogar', count: game.platforms?.length },
    { id: 'activity', label: 'Atividade', count: activities.length },
    { id: 'gallery', label: 'Galeria', count: mediaCount > 0 ? mediaCount : undefined },
    { id: 'details', label: 'Ficha Técnica' }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-white/20">
      <TopNav />

      {/* Hero Section matching Plotwist reference image */}
      <GameHero
        game={game}
        onOpenReviewModal={handleOpenReview}
        bannerUrl={selectedBannerUrl}
      />

      {/* Main Tabs Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-8 pb-24 space-y-8">
        {/* Sleek Horizontal Tab Bar (Capsule / Pill Style) */}
        <div className="border-b border-white/[0.08] pb-1">
          <nav className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 active:scale-[0.97] ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-black'
                          : 'bg-white/[0.06] text-neutral-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="game-tab-pill"
                      className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-white"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
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
                isReviewModalOpen={isReviewModalOpen}
                onCloseReviewModal={() => setIsReviewModalOpen(!isReviewModalOpen)}
                onReviewCreated={handleReviewCreated}
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

          {activeTab === 'platforms' && (
            <motion.div
              key="platforms"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-4"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Plataformas Disponíveis
              </h3>
              <GamePlatforms platforms={game.platforms || []} />
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
    </div>
  );
}
