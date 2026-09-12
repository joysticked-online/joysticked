'use client';

import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

import { TopNav } from '@/components/navigation/top-nav';
import { ProfileBanner } from '@/components/profile/profile-banner';
import { ProfileSidebar } from '@/components/profile/profile-sidebar';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { ActivityTab } from '@/components/profile/tabs/activity-tab';
import { CollectionTab } from '@/components/profile/tabs/collection-tab';
import { ListsTab } from '@/components/profile/tabs/lists-tab';
import { ReviewsTab } from '@/components/profile/tabs/reviews-tab';
import { StatsTab } from '@/components/profile/tabs/stats-tab';
import { GAME_CATALOG_LOOKUP, type Profile, type ProfileGame, type Tab } from '@/components/profile/types';
import { useAuth } from '@/hooks/use-auth';
import type { GameReview } from '@/lib/games';

// Read all local_reviews_* keys from localStorage for this user
function readLocalReviews(userId: string, username?: string): GameReview[] {
  if (typeof window === 'undefined') return [];
  const allReviews: GameReview[] = [];
  const normalizedUsername = username?.toLowerCase();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('local_reviews_')) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const list: GameReview[] = JSON.parse(raw);
      // Include reviews written by this user matching either ID or username
      for (const r of list) {
        const matchesUser =
          (userId && (r.userId === userId || r.user?.id === userId)) ||
          (normalizedUsername && r.user?.username?.toLowerCase() === normalizedUsername);
        if (matchesUser) {
          allReviews.push(r);
        }
      }
    }
  } catch {}
  // Sort newest first
  allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return allReviews;
}

// Convert a GameReview into a ProfileGame shape for the collection / activity tabs
function reviewToProfileGame(review: GameReview): ProfileGame {
  // Try to enrich with cover data from the catalog if the slug matches
  const catalogEntry = GAME_CATALOG_LOOKUP[review.gameSlug];
  return {
    id: review.gameSlug,
    title: review.gameTitle,
    coverUrl: catalogEntry?.coverUrl ?? `https://images.igdb.com/igdb/image/upload/t_cover_big/${review.gameSlug}.webp`,
    backdropUrl: catalogEntry?.backdropUrl,
    year: catalogEntry?.year ?? new Date(review.createdAt).getFullYear().toString(),
    developer: catalogEntry?.developer ?? '',
    status: 'Avaliado',
    rating: review.rating,
    hours: review.hoursPlayed ?? undefined,
    reviewSnippet: review.reviewText ?? undefined,
    genres: catalogEntry?.genres ?? [],
    platformTag: review.platform ?? catalogEntry?.platformTag,
    completedDate: new Date(review.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  };
}

export function PublicProfileView({ profile }: { profile: Profile }) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [localReviews, setLocalReviews] = useState<GameReview[]>([]);

  const isOwnProfile = Boolean(
    currentUser && (currentUser.id === profile.id || currentUser.username.toLowerCase() === profile.username.toLowerCase())
  );

  // On mount and review events, scan localStorage for this user's reviews
  useEffect(() => {
    const fetchReviews = () => {
      const userId = isOwnProfile && currentUser ? currentUser.id : profile.id;
      const username = isOwnProfile && currentUser ? currentUser.username : profile.username;
      const reviews = readLocalReviews(userId, username);
      setLocalReviews(reviews);
    };

    fetchReviews();

    const handleSync = () => fetchReviews();
    window.addEventListener('storage', handleSync);
    window.addEventListener('joysticked:review-updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('joysticked:review-updated', handleSync);
    };
  }, [profile.id, profile.username, currentUser, isOwnProfile]);

  const displayName = profile.displayName || profile.username;
  const genres = profile.preferences?.genres || [];
  const likedGameIds = profile.preferences?.likedGames || [];

  // Games from onboarding preferences
  const likedGames = likedGameIds.map((id) => GAME_CATALOG_LOOKUP[id]).filter(Boolean);

  // Games derived from real localStorage reviews (deduplicated by slug)
  const reviewedGames: ProfileGame[] = localReviews.map(reviewToProfileGame);
  const reviewedSlugs = new Set(reviewedGames.map((g) => g.id));

  // Merge: reviewed games take priority (they have real rating/review data),
  // then fill in liked games that weren't reviewed
  const displayGames: ProfileGame[] = [
    ...reviewedGames,
    ...likedGames.filter((g) => !reviewedSlugs.has(g.id))
  ];

  return (
    <div className="relative min-h-screen bg-[#070709] font-geist-sans text-neutral-100 selection:bg-neutral-100 selection:text-black">
      {/* ── Top Navigation Bar ── */}
      <TopNav />

      {/* ── Cinematic Hero Banner ── */}
      <ProfileBanner bannerUrl={profile.bannerUrl} displayGames={displayGames} />

      {/* ── Main Layout Container ── */}
      <div className="mx-auto max-w-6xl px-4 pb-28 sm:px-6 md:px-8">
        <div className="-mt-20 md:-mt-28 relative grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* ── LEFT COLUMN: Centered Player Profile Card ── */}
          <ProfileSidebar
            profile={profile}
            isOwnProfile={isOwnProfile}
            displayGames={displayGames}
          />

          {/* ── RIGHT COLUMN: Content Stream & Lower Tabs ── */}
          <div className="space-y-6 pt-10 lg:col-span-8 lg:pt-20 xl:col-span-8.5">
            {/* Pill Tab Navigation with Liquid Morphing Indicator */}
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Dynamic Tab Views */}
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === 'activity' && (
                <ActivityTab
                  key="activity"
                  displayGames={displayGames}
                  displayName={displayName}
                  localReviews={localReviews}
                />
              )}

              {activeTab === 'collection' && (
                <CollectionTab key="collection" displayGames={displayGames} />
              )}

              {activeTab === 'lists' && <ListsTab key="lists" displayGames={displayGames} />}

              {activeTab === 'reviews' && (
                <ReviewsTab
                  key="reviews"
                  displayGames={displayGames}
                  localReviews={localReviews}
                />
              )}

              {activeTab === 'stats' && (
                <StatsTab
                  key="stats"
                  genres={genres}
                  displayGames={displayGames}
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
