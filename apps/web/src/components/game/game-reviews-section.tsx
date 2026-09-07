'use client';

import { ArrowUpDown, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Game, GameReview } from '@/lib/games';
import { GameReviewCard } from './game-review-card';

interface GameReviewsSectionProps {
  game: Game;
  initialReviews: GameReview[];
  onOpenReviewModal: () => void;
  onEditReview?: (review: GameReview) => void;
}

type SortOption = 'recent' | 'likes' | 'highest';

export function GameReviewsSection({
  game,
  initialReviews,
  onOpenReviewModal,
  onEditReview
}: GameReviewsSectionProps) {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>(initialReviews);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Keep reviews synced if initialReviews updates
  const activeReviews = initialReviews.length !== reviews.length ? initialReviews : reviews;

  // Sorted reviews
  const sortedReviews = [...activeReviews].sort((a, b) => {
    switch (sortBy) {
      case 'likes':
        return b.likesCount - a.likesCount;
      case 'highest':
        return b.rating - a.rating;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => {
      const isLiked = !prev[reviewId];
      setReviews((revs) =>
        revs.map((r) =>
          r.id === reviewId ? { ...r, likesCount: r.likesCount + (isLiked ? 1 : -1) } : r
        )
      );
      return { ...prev, [reviewId]: isLiked };
    });
  };

  const isUserReview = (rev: GameReview) => {
    if (!currentUser) return false;
    return rev.userId === currentUser.id || rev.user?.username === currentUser.username;
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls with Liquid Spring Animation */}
      <div className="flex flex-col justify-between gap-3 border-white/[0.08] border-b pb-2 sm:flex-row sm:items-center">
        <h4 className="flex items-center gap-2 font-semibold text-neutral-400 text-xs uppercase tracking-wider">
          <MessageSquare className="size-3.5 text-neutral-400" />
          <span>Avaliações da Comunidade ({activeReviews.length})</span>
        </h4>

        {activeReviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-neutral-500 text-xs">
              <ArrowUpDown className="size-3" />
              <span>Ordenar:</span>
            </span>
            <div className="relative flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
              {(
                [
                  { id: 'recent', label: 'Recentes' },
                  { id: 'likes', label: 'Curtidas' },
                  { id: 'highest', label: 'Maior Nota' }
                ] as const
              ).map((opt) => {
                const isActive = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`relative cursor-pointer select-none rounded-lg px-2.5 py-1 font-medium text-[11px] transition-colors ${
                      isActive ? 'font-semibold text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sort-filter-liquid-pill"
                        className="absolute inset-0 rounded-lg bg-white shadow-sm"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 30
                        }}
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Feed */}
      {sortedReviews.length === 0 ? (
        <div className="space-y-3 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-400">
            <MessageSquare className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm text-white">Nenhuma avaliação ainda</p>
            <p className="mx-auto max-w-sm text-neutral-400 text-xs">
              Seja o primeiro a compartilhar sua experiência sobre {game.title} com a comunidade!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenReviewModal}
            className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold text-black text-xs transition-colors hover:bg-neutral-200"
          >
            <span>Avaliar agora</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedReviews.map((rev) => (
            <GameReviewCard
              key={rev.id}
              review={rev}
              isMine={isUserReview(rev)}
              isLiked={Boolean(likedReviews[rev.id])}
              onToggleLike={toggleLike}
              onEdit={onEditReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
