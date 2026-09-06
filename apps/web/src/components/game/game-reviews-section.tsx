'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  Gamepad2,
  Monitor,
  Smartphone,
  Check,
  Reply,
  Clock,
  Sparkles,
  PenLine,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';
import { submitGameReview, type Game, type GameReview } from '@/lib/games';

interface GameReviewsSectionProps {
  game: Game;
  initialReviews: GameReview[];
  isReviewModalOpen: boolean;
  onCloseReviewModal: () => void;
  onReviewCreated?: (review: GameReview) => void;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; score: string }> = {
  1: { label: 'Ruim', score: '1.0' },
  2: { label: 'Regular', score: '2.0' },
  3: { label: 'Bom', score: '3.0' },
  4: { label: 'Muito Bom', score: '4.0' },
  5: { label: 'Obra-prima', score: '5.0' }
};

function getPlatformIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('pc') || lower.includes('windows') || lower.includes('mac') || lower.includes('linux')) {
    return <Monitor className="size-3.5" />;
  }
  if (lower.includes('ios') || lower.includes('android')) {
    return <Smartphone className="size-3.5" />;
  }
  return <Gamepad2 className="size-3.5" />;
}

export function GameReviewsSection({
  game,
  initialReviews,
  isReviewModalOpen,
  onCloseReviewModal,
  onReviewCreated
}: GameReviewsSectionProps) {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState(game.platforms?.[0] || '');
  const [hoursPlayed, setHoursPlayed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Faça login para deixar uma avaliação.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitGameReview(game.slug, {
        gameId: game.id,
        gameTitle: game.name,
        rating,
        reviewText: reviewText.trim() || undefined,
        platform: selectedPlatform || undefined,
        hoursPlayed: hoursPlayed.trim() || undefined
      });

      const newReview: GameReview = response.review || {
        id: `local-${Date.now()}`,
        gameId: String(game.id),
        gameSlug: game.slug,
        gameTitle: game.name,
        userId: currentUser.id,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName || currentUser.username,
          avatarUrl: currentUser.avatarUrl
        },
        rating,
        reviewText: reviewText.trim() || null,
        platform: selectedPlatform || null,
        hoursPlayed: hoursPlayed.trim() || null,
        likesCount: 0,
        createdAt: new Date().toISOString()
      };

      setReviews((prev) => [newReview, ...prev]);
      onReviewCreated?.(newReview);
      setReviewText('');
      setHoursPlayed('');
      onCloseReviewModal();

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });

      toast.success('Avaliação publicada com sucesso!');
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao publicar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => {
      const isLiked = !!prev[reviewId];
      setReviews((revs) =>
        revs.map((r) =>
          r.id === reviewId ? { ...r, likesCount: r.likesCount + (isLiked ? -1 : 1) } : r
        )
      );
      return { ...prev, [reviewId]: !isLiked };
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. REVIEW FORM CARD (Polished, modern & intuitive) */}
      <div className="rounded-3xl border border-white/12 bg-neutral-900/60 p-6 sm:p-7 backdrop-blur-2xl space-y-6 shadow-2xl">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <PenLine className="size-4.5 text-neutral-300" />
              <span>Sua Avaliação de {game.name}</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Compartilhe sua experiência e nota com a comunidade.
            </p>
          </div>

          {/* Rating Score Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1 backdrop-blur-md">
            <Star className="size-3.5 fill-white text-white" />
            <span className="text-xs font-bold text-white">{ratingInfo.score}</span>
            <span className="text-xs text-neutral-400">• {ratingInfo.label}</span>
          </div>
        </div>

        {/* Large Interactive Star Rating Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-neutral-400 block">
            Sua Nota
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <motion.button
                key={starValue}
                type="button"
                whileHover={{ scale: 1.25, rotate: -6 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(null)}
                onClick={() => setRating(starValue)}
                className="p-1 cursor-pointer focus:outline-hidden"
              >
                <Star
                  className={`size-7 sm:size-8 transition-colors duration-150 ${
                    starValue <= activeRating
                      ? 'fill-white text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                      : 'text-neutral-700 hover:text-neutral-500'
                  }`}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Platform Selection Chips (Instant 1-click pills) */}
        {game.platforms && game.platforms.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-400 block">
              Plataforma Jogada
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {game.platforms.map((p) => {
                const isSelected = selectedPlatform === p;
                return (
                  <motion.button
                    key={p}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedPlatform(isSelected ? '' : p)}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer select-none border ${
                      isSelected
                        ? 'border-white bg-white text-black font-semibold shadow-md'
                        : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {getPlatformIcon(p)}
                    <span>{p}</span>
                    {isSelected && <Check className="size-3 text-black" />}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Hours Played & Review Text */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-400 block">
              Tempo de Jogo (Opcional)
            </label>
            <div className="relative max-w-xs">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500" />
              <input
                type="text"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(e.target.value)}
                placeholder="Ex: 85 horas"
                className="w-full h-10 rounded-xl border border-white/10 bg-black/60 pl-9 pr-3.5 text-xs text-white placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-neutral-400 block">
              Sua Análise / Comentário (Opcional)
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="O que achou da história, jogabilidade, gráficos ou trilha sonora?"
              className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-1">
          <motion.button
            type="button"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            className="h-10 rounded-xl bg-white text-black hover:bg-neutral-200 px-6 text-xs font-bold flex items-center gap-2 shadow-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="size-3.5 text-black" />
            <span>{isSubmitting ? 'Enviando...' : 'Publicar Avaliação'}</span>
          </motion.button>
        </div>
      </div>

      {/* 2. COMMUNITY REVIEWS FEED */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">
            Avaliações da Comunidade ({reviews.length})
          </h4>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-10 text-center">
            <MessageSquare className="size-8 mx-auto text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-300">Nenhuma avaliação publicada ainda</p>
            <p className="text-xs text-neutral-500 mt-1">
              Avalie acima para ser o primeiro!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="space-y-2.5">
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <Link
                      href={`/${rev.user?.username || ''}`}
                      className="size-8 shrink-0 overflow-hidden rounded-full bg-neutral-800 border border-white/10"
                    >
                      {rev.user?.avatarUrl ? (
                        <img
                          src={rev.user.avatarUrl}
                          alt={rev.user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-xs text-neutral-300">
                          {rev.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </Link>

                    {/* Name + Stars + Date */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <Link
                        href={`/${rev.user?.username || ''}`}
                        className="font-semibold text-white hover:underline"
                      >
                        {rev.user?.displayName || rev.user?.username}
                      </Link>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-white">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3 ${
                              s <= rev.rating ? 'fill-white text-white' : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>

                      <span className="text-neutral-500">•</span>
                      <span className="text-neutral-500">
                        {new Date(rev.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Platform Tag */}
                  {rev.platform && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-neutral-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-lg">
                      {getPlatformIcon(rev.platform)}
                      <span>{rev.platform}</span>
                    </span>
                  )}
                </div>

                {/* Review Text Container (Plotwist box style) */}
                {rev.reviewText && (
                  <div className="ml-10 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs sm:text-sm leading-relaxed text-neutral-300">
                    <p className="whitespace-pre-line">{rev.reviewText}</p>
                  </div>
                )}

                {/* Actions row */}
                <div className="ml-10 flex items-center gap-4 text-xs text-neutral-500 pt-0.5">
                  <button
                    type="button"
                    onClick={() => toggleLike(rev.id)}
                    className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      likedReviews[rev.id] ? 'text-white font-medium' : 'hover:text-neutral-300'
                    }`}
                  >
                    <ThumbsUp className="size-3" />
                    <span>Curtir {rev.likesCount > 0 ? `(${rev.likesCount})` : ''}</span>
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => toast.info('Respostas em breve!')}
                    className="inline-flex items-center gap-1 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    <Reply className="size-3" />
                    <span>Responder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
