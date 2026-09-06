'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { TopNav } from '@/components/navigation/top-nav';
import { ProfileBanner } from '@/components/profile/profile-banner';
import { ProfileSidebar } from '@/components/profile/profile-sidebar';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { ActivityTab } from '@/components/profile/tabs/activity-tab';
import { CollectionTab } from '@/components/profile/tabs/collection-tab';
import { ListsTab } from '@/components/profile/tabs/lists-tab';
import { ReviewsTab } from '@/components/profile/tabs/reviews-tab';
import { StatsTab } from '@/components/profile/tabs/stats-tab';
import {
  GAME_CATALOG_LOOKUP,
  type Profile,
  type Tab
} from '@/components/profile/types';
import { useAuth } from '@/hooks/use-auth';

export function PublicProfileView({ profile }: { profile: Profile }) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('activity');

  const isOwnProfile = Boolean(
    currentUser && (currentUser.id === profile.id || currentUser.username === profile.username)
  );

  const displayName = profile.displayName || profile.username;
  const genres = profile.preferences?.genres || [];
  const likedGameIds = profile.preferences?.likedGames || [];

  const userLikedGames = likedGameIds
    .map((id) => GAME_CATALOG_LOOKUP[id])
    .filter(Boolean);

  const displayGames =
    userLikedGames.length > 0 ? userLikedGames : Object.values(GAME_CATALOG_LOOKUP);

  return (
    <div className="relative min-h-screen bg-[#070709] font-geist-sans text-neutral-100 selection:bg-neutral-100 selection:text-black">
      {/* ── Top Navigation Bar ── */}
      <TopNav />

      {/* ── Cinematic Hero Banner ── */}
      <ProfileBanner bannerUrl={profile.bannerUrl} displayGames={displayGames} />

      {/* ── Main Layout Container ── */}
      <div className="mx-auto max-w-6xl px-4 pb-28 sm:px-6 md:px-8">
        <div className="relative -mt-20 md:-mt-28 grid grid-cols-1 gap-10 lg:grid-cols-12">
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
                />
              )}

              {activeTab === 'collection' && (
                <CollectionTab key="collection" displayGames={displayGames} />
              )}

              {activeTab === 'lists' && (
                <ListsTab key="lists" displayGames={displayGames} />
              )}

              {activeTab === 'reviews' && (
                <ReviewsTab key="reviews" displayGames={displayGames} />
              )}

              {activeTab === 'stats' && (
                <StatsTab key="stats" genres={genres} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
