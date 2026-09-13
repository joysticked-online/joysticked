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
  allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return allReviews;
}

// Read all game_meta_* keys stored from game pages
function readLocalGameMetas(): Record<string, Partial<ProfileGame>> {
  if (typeof window === 'undefined') return {};
  const map: Record<string, Partial<ProfileGame>> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('game_meta_')) continue;
      const slug = key.replace('game_meta_', '');
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      map[slug] = JSON.parse(raw);
    }
  } catch {}
  return map;
}

// Convert a GameReview into a ProfileGame shape
function reviewToProfileGame(
  review: GameReview,
  metaMap: Record<string, Partial<ProfileGame>>
): ProfileGame {
  const catalogEntry = GAME_CATALOG_LOOKUP[review.gameSlug];
  const metaEntry = metaMap[review.gameSlug];
  const rawStatus = metaEntry?.status || localStorage.getItem(`game_status_${review.gameSlug}`) || 'Jogado';
  return {
    id: review.gameSlug,
    title: metaEntry?.title || review.gameTitle,
    coverUrl: metaEntry?.coverUrl || catalogEntry?.coverUrl || '',
    backdropUrl: metaEntry?.backdropUrl || catalogEntry?.backdropUrl,
    year: metaEntry?.year || catalogEntry?.year || new Date(review.createdAt).getFullYear().toString(),
    developer: metaEntry?.developer || catalogEntry?.developer || '',
    status: rawStatus,
    rating: review.rating,
    hours: review.hoursPlayed ?? metaEntry?.hours,
    reviewSnippet: review.reviewText ?? undefined,
    genres: metaEntry?.genres || catalogEntry?.genres || [],
    platformTag: review.platform ?? metaEntry?.platformTag ?? catalogEntry?.platformTag,
    completedDate: new Date(review.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
  };
}

export function PublicProfileView({ profile: initialProfile }: { profile: Profile }) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [localReviews, setLocalReviews] = useState<GameReview[]>([]);
  const [gameMetas, setGameMetas] = useState<Record<string, Partial<ProfileGame>>>({});

  const isOwnProfile = Boolean(
    currentUser && (currentUser.id === initialProfile.id || currentUser.username.toLowerCase() === initialProfile.username.toLowerCase())
  );

  // If viewing own profile, prioritize freshest client auth state & localStorage
  const profile: Profile = isOwnProfile && currentUser ? {
    id: currentUser.id || initialProfile.id,
    username: currentUser.username || initialProfile.username,
    displayName: currentUser.displayName ?? initialProfile.displayName,
    avatarUrl: currentUser.avatarUrl ?? initialProfile.avatarUrl,
    bannerUrl: currentUser.bannerUrl ?? initialProfile.bannerUrl,
    bio: currentUser.bio ?? initialProfile.bio,
    socials: currentUser.socials ?? initialProfile.socials,
    preferences: currentUser.preferences ?? initialProfile.preferences,
    createdAt: (currentUser.createdAt ? String(currentUser.createdAt) : null) || initialProfile.createdAt
  } : initialProfile;

  useEffect(() => {
    const fetchLocalData = () => {
      const userId = isOwnProfile && currentUser ? currentUser.id : profile.id;
      const username = isOwnProfile && currentUser ? currentUser.username : profile.username;
      const reviews = readLocalReviews(userId, username);
      const metas = readLocalGameMetas();
      setLocalReviews(reviews);
      setGameMetas(metas);
    };

    fetchLocalData();

    const handleSync = () => fetchLocalData();
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

  const likedGames = likedGameIds.map((id) => GAME_CATALOG_LOOKUP[id]).filter(Boolean);
  const reviewedGames: ProfileGame[] = localReviews.map((r) => reviewToProfileGame(r, gameMetas));
  const reviewedSlugs = new Set(reviewedGames.map((g) => g.id));

  const statusGames: ProfileGame[] = Object.values(gameMetas)
    .filter((m): m is ProfileGame => Boolean(m && m.id && m.title && !reviewedSlugs.has(m.id)))
    .map((m) => ({
      id: m.id,
      title: m.title,
      coverUrl: m.coverUrl || GAME_CATALOG_LOOKUP[m.id]?.coverUrl || '',
      backdropUrl: m.backdropUrl || GAME_CATALOG_LOOKUP[m.id]?.backdropUrl,
      year: m.year || GAME_CATALOG_LOOKUP[m.id]?.year || '',
      developer: m.developer || GAME_CATALOG_LOOKUP[m.id]?.developer || '',
      status: m.status || 'Jogado',
      rating: m.rating,
      hours: m.hours,
      genres: m.genres || GAME_CATALOG_LOOKUP[m.id]?.genres || [],
      platformTag: m.platformTag || GAME_CATALOG_LOOKUP[m.id]?.platformTag
    }));

  const knownSlugs = new Set([...reviewedGames.map((g) => g.id), ...statusGames.map((g) => g.id)]);

  const displayGames: ProfileGame[] = [
    ...reviewedGames,
    ...statusGames,
    ...likedGames.filter((g) => !knownSlugs.has(g.id))
  ];

  return (
    <div className="relative min-h-screen bg-[#08080a] font-geist-sans text-white selection:bg-white selection:text-black">
      {/* Subtle Background Matrix Texture */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_30%,#000_60%,transparent_100%)] opacity-70"
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <TopNav />

      {/* Monochrome Hero Banner */}
      <ProfileBanner bannerUrl={profile.bannerUrl} displayGames={displayGames} />

      {/* Main Grid Container */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6 md:px-8">
        <div className="-mt-16 sm:-mt-20 md:-mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Player Profile Sidebar */}
          <ProfileSidebar
            profile={profile}
            isOwnProfile={isOwnProfile}
            displayGames={displayGames}
          />

          {/* Right Column: Tab Navigation & Content Feed */}
          <section className="space-y-5 pt-4 sm:pt-6 lg:col-span-8 lg:pt-14 xl:col-span-8.5">
            {/* Liquid Pill Tab Navigation */}
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

              {activeTab === 'lists' && (
                <ListsTab
                  key="lists"
                  displayGames={displayGames}
                  username={profile.username}
                  isOwnProfile={isOwnProfile}
                />
              )}

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
          </section>
        </div>
      </main>
    </div>
  );
}
