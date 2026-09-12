/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { AlertTriangle, Edit3, Gamepad2, Monitor, Reply, Smartphone, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import type { GameReview } from '@/lib/games';
import { PixelHeart } from '@/components/landing/pixel-heart';

interface GameReviewCardProps {
  review: GameReview;
  isMine: boolean;
  isLiked: boolean;
  onToggleLike: (reviewId: string) => void;
  onEdit?: (review: GameReview) => void;
}

function getPlatformIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes('pc') ||
    lower.includes('windows') ||
    lower.includes('mac') ||
    lower.includes('linux')
  ) {
    return <Monitor className="size-3.5" />;
  }
  if (lower.includes('ios') || lower.includes('android')) {
    return <Smartphone className="size-3.5" />;
  }
  return <Gamepad2 className="size-3.5" />;
}

export function GameReviewCard({
  review,
  isMine,
  isLiked,
  onToggleLike,
  onEdit
}: GameReviewCardProps) {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const hasHiddenSpoiler = Boolean(review.containsSpoiler && !showSpoiler);

  return (
    <div
      className={`space-y-3 rounded-2xl p-4 transition-colors sm:p-5 ${
        isMine ? 'bg-white/[0.02]' : 'bg-white/[0.02]'
      }`}
    >
      {/* Author row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <Link
            href={`/${review.user?.username || ''}`}
            className="size-8.5 shrink-0 overflow-hidden rounded-full bg-neutral-800"
          >
            {review.user?.avatarUrl ? (
              <img
                src={review.user.avatarUrl}
                alt={review.user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-bold text-neutral-300 text-xs">
                {review.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </Link>

          {/* Name + Stars + Date */}
          <div className="space-y-0.5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/${review.user?.username || ''}`}
                className="font-bold text-white hover:underline"
              >
                {review.user?.displayName || review.user?.username}
              </Link>

              {isMine && (
                <span className="rounded-md bg-white/15 px-1.5 py-0.2 font-semibold text-[10px] text-neutral-200">
                  Você
                </span>
              )}

              {/* Pixel Heart Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => {
                  const isFull = review.rating >= i;
                  const isHalf = !isFull && review.rating >= i - 0.5;
                  return (
                    <PixelHeart
                      key={i}
                      size={12}
                      variant={isFull ? 'full' : isHalf ? 'half' : 'empty'}
                      color="#EF4444"
                    />
                  );
                })}
                <span className="ml-1 font-mono text-[10px] font-bold text-neutral-300">
                  {Number(review.rating).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span>
                {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              {review.hoursPlayed && (
                <>
                  <span>•</span>
                  <span>{review.hoursPlayed}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform Tag */}
          {review.platform && (
            <span className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-neutral-300 sm:inline-flex">
              {getPlatformIcon(review.platform)}
              <span>{review.platform}</span>
            </span>
          )}

          {/* Edit Action for Author */}
          {isMine && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(review)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-medium text-[11px] text-neutral-300 transition-colors hover:bg-white hover:text-black"
            >
              <Edit3 className="size-3" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Review Text */}
      {review.reviewText && (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20">
          <div className={hasHiddenSpoiler ? 'select-none blur-md' : 'whitespace-pre-line'}>
            <div className="p-3 text-neutral-300 text-xs leading-relaxed sm:p-4 sm:text-sm">
              {review.reviewText}
            </div>
          </div>
          {hasHiddenSpoiler && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-950/65 p-4 text-center backdrop-blur-sm">
              <AlertTriangle className="size-4 text-amber-300" />
              <span className="font-semibold text-white text-xs">
                Esta avaliação contém spoiler
              </span>
              <button
                type="button"
                onClick={() => setShowSpoiler(true)}
                className="cursor-pointer rounded-lg bg-white px-3 py-1.5 font-bold text-[11px] text-black transition-colors hover:bg-neutral-200"
              >
                Mostrar spoiler
              </button>
            </div>
          )}
        </div>
      )}

      {/* Social Actions Row */}
      <div className="flex items-center gap-4 border-white/[0.04] border-t pt-2 text-neutral-500 text-xs">
        <button
          type="button"
          onClick={() => onToggleLike(review.id)}
          className={`inline-flex cursor-pointer items-center gap-1.5 transition-colors ${
            isLiked ? 'font-semibold text-white' : 'hover:text-neutral-300'
          }`}
        >
          <ThumbsUp className={`size-3 ${isLiked ? 'fill-white text-white' : ''}`} />
          <span>Curtir {review.likesCount > 0 ? `(${review.likesCount})` : ''}</span>
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => toast.info('Respostas em breve!')}
          className="inline-flex cursor-pointer items-center gap-1 transition-colors hover:text-neutral-300"
        >
          <Reply className="size-3" />
          <span>Responder</span>
        </button>
      </div>
    </div>
  );
}
