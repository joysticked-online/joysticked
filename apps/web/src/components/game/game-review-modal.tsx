'use client';

import confetti from 'canvas-confetti';
import { AlertTriangle, Check, Clock, Gamepad2, Monitor, Send, Smartphone, Star, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { type Game, type GameReview, submitGameReview } from '@/lib/games';

interface GameReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  initialReview?: GameReview | null;
  onReviewCreated?: (review: GameReview) => void;
  onReviewDeleted?: (reviewId: string) => void;
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

export function GameReviewModal({
  isOpen,
  onClose,
  game,
  initialReview,
  onReviewCreated,
  onReviewDeleted
}: GameReviewModalProps) {
  const { user: currentUser } = useAuth();
  const [rating, setRating] = useState<number>(initialReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState(initialReview?.reviewText || '');
  const [containsSpoiler, setContainsSpoiler] = useState(initialReview?.containsSpoiler ?? false);
  const [selectedPlatform, setSelectedPlatform] = useState(
    initialReview?.platform || game.platforms?.[0] || ''
  );
  const [hoursPlayed, setHoursPlayed] = useState(initialReview?.hoursPlayed || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when initialReview changes
  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setReviewText(initialReview.reviewText || '');
      setContainsSpoiler(initialReview.containsSpoiler ?? false);
      setSelectedPlatform(initialReview.platform || game.platforms?.[0] || '');
      setHoursPlayed(initialReview.hoursPlayed || '');
    } else {
      setRating(5);
      setReviewText('');
      setContainsSpoiler(false);
      setSelectedPlatform(game.platforms?.[0] || '');
      setHoursPlayed('');
    }
  }, [initialReview, game.platforms]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const activeRating = hoverRating !== null ? hoverRating : rating;
  const ratingInfo = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];
  const isEditing = Boolean(initialReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const reviewUser = currentUser
        ? {
            id: currentUser.id,
            username: currentUser.username,
            displayName: currentUser.displayName || currentUser.username,
            avatarUrl: currentUser.avatarUrl
          }
        : initialReview?.user || {
            id: 'guest',
            username: 'guest',
            displayName: 'Visitante',
            avatarUrl: null
          };

      let updatedReview: GameReview | null = null;

      try {
        const response = await submitGameReview(game.slug, {
          gameId: game.id,
          gameTitle: game.name,
          rating,
          reviewText: reviewText.trim() || undefined,
          containsSpoiler,
          platform: selectedPlatform || undefined,
          hoursPlayed: hoursPlayed.trim() || undefined
        });
        if (response?.review) {
          updatedReview = response.review;
        }
      } catch {
        // Backend offline fallback
      }

      if (!updatedReview) {
        updatedReview = {
          id: initialReview?.id || `rev-${Date.now()}`,
          gameId: String(game.id),
          gameSlug: game.slug,
          gameTitle: game.name,
          userId: reviewUser.id,
          user: reviewUser,
          rating,
          reviewText: reviewText.trim() || null,
          containsSpoiler,
          platform: selectedPlatform || null,
          hoursPlayed: hoursPlayed.trim() || null,
          likesCount: initialReview?.likesCount || 0,
          createdAt: initialReview?.createdAt || new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(`local_reviews_${game.slug}`) || '[]';
          try {
            const list: GameReview[] = JSON.parse(stored);
            const filtered = list.filter((r) => r.id !== updatedReview!.id);
            localStorage.setItem(
              `local_reviews_${game.slug}`,
              JSON.stringify([updatedReview, ...filtered])
            );

            const playedList = JSON.parse(localStorage.getItem('joysticked_played_games') || '[]');
            if (!playedList.includes(game.slug)) {
              localStorage.setItem(
                'joysticked_played_games',
                JSON.stringify([game.slug, ...playedList])
              );
            }
          } catch {}
        }
      }

      onReviewCreated?.(updatedReview);
      onClose();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      toast.success(
        isEditing ? 'Avaliação atualizada com sucesso!' : 'Avaliação publicada com sucesso!'
      );
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!initialReview) return;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`local_reviews_${game.slug}`) || '[]';
      try {
        const list: GameReview[] = JSON.parse(stored);
        const filtered = list.filter((r) => r.id !== initialReview.id);
        localStorage.setItem(`local_reviews_${game.slug}`, JSON.stringify(filtered));
      } catch {}
    }
    onReviewDeleted?.(initialReview.id);
    onClose();
    toast.info('Avaliação removida.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="scrollbar-none relative z-10 max-h-[92vh] w-full max-w-xl overflow-hidden overflow-y-auto rounded-3xl border border-white/15 bg-[#141414] shadow-2xl shadow-black/60"
          >
            {/* Header with Game Info & Close Button */}
            <div className="flex items-center justify-between gap-3 border-white/10 border-b bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.12),transparent_48%)] px-5 py-5 sm:px-7">
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-neutral-950 shadow-lg">
                  {game.coverUrl ? (
                    <img src={game.coverUrl} alt={game.name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-neutral-600">
                      <Gamepad2 className="size-4" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="block font-semibold text-[10px] text-neutral-400 uppercase tracking-[0.18em]">
                    {isEditing ? 'Editar avaliação' : 'Avaliar jogo'}
                  </span>
                  <h3 className="mt-0.5 truncate font-bold text-base text-white">{game.name}</h3>
                  <p className="mt-1 text-[11px] text-neutral-500">Sua nota ajuda a comunidade a descobrir bons jogos.</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    title="Excluir Avaliação"
                    className="cursor-pointer rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 cursor-pointer rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
              {/* Rating Selector */}
              <div className="space-y-4 rounded-2xl border border-amber-200/15 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.1),transparent_65%)] p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-semibold text-[11px] text-neutral-300 uppercase tracking-wider">
                      Dê uma nota
                    </span>
                    <span className="mt-1 block text-[11px] text-neutral-500">
                      Toque nas estrelas para escolher
                    </span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-semibold text-white text-xs">
                    {ratingInfo.score} <span className="font-normal text-neutral-400">/ 5</span>
                  </span>
                </div>

                {/* Stars */}
                <div className="flex items-center justify-center gap-1 py-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <motion.button
                      key={starValue}
                      type="button"
                      whileHover={{ scale: 1.18 }}
                      whileTap={{ scale: 0.92 }}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starValue)}
                      aria-pressed={rating === starValue}
                      aria-label={`${starValue} de 5 estrelas`}
                      className="cursor-pointer rounded-xl p-1.5 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70"
                    >
                      <Star
                        className={`size-8 transition-colors duration-100 sm:size-9 ${
                          starValue <= activeRating
                            ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_10px_rgba(252,211,77,0.45)]'
                            : 'text-neutral-700 hover:text-neutral-500'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 text-center">
                  <span className="font-semibold text-sm text-white">{ratingInfo.label}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-[11px] text-neutral-500">{activeRating} de 5 estrelas</span>
                </div>
              </div>

              {/* Platform Chips */}
              {game.platforms && game.platforms.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <span className="block font-semibold text-[11px] text-neutral-300 uppercase tracking-wider">
                    Plataforma Jogada
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {game.platforms.map((p) => {
                      const isSelected = selectedPlatform === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSelectedPlatform(isSelected ? '' : p)}
                          className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-[11px] transition-colors ${
                            isSelected
                              ? 'border-white bg-white font-semibold text-black'
                              : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          {getPlatformIcon(p)}
                          <span>{p}</span>
                          {isSelected && <Check className="size-2.5 text-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hours & Review Text */}
              <div className="grid gap-4 sm:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] sm:gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="modal-hours-played"
                    className="block font-semibold text-[11px] text-neutral-400 uppercase tracking-wider"
                  >
                    Tempo de Jogo (Opcional)
                  </label>
                  <div className="relative">
                    <Clock className="-translate-y-1/2 absolute top-1/2 left-3 size-3 text-neutral-500" />
                    <input
                      id="modal-hours-played"
                      type="text"
                      value={hoursPlayed}
                      onChange={(e) => setHoursPlayed(e.target.value)}
                      placeholder="Ex: 85 horas"
                      className="h-8.5 w-full rounded-lg border border-white/10 bg-black/50 pr-3 pl-8 text-white text-xs transition-colors placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="modal-review-text"
                    className="block font-semibold text-[11px] text-neutral-400 uppercase tracking-wider"
                  >
                    Comentário (Opcional)
                  </label>
                  <textarea
                    id="modal-review-text"
                    rows={5}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="O que você achou do jogo? Jogabilidade, história, trilha sonora..."
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/50 p-3.5 text-white text-sm leading-relaxed transition-colors placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden"
                  />
                  <div className="text-right text-[10px] text-neutral-600">{reviewText.length}/500</div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200/15 bg-amber-200/[0.04] p-3 transition-colors hover:bg-amber-200/[0.07]">
                    <input
                      type="checkbox"
                      checked={containsSpoiler}
                      onChange={(event) => setContainsSpoiler(event.target.checked)}
                      className="mt-0.5 size-4 accent-amber-300"
                    />
                    <span className="flex gap-2">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
                      <span>
                        <span className="block font-semibold text-xs text-amber-100">Contém spoiler</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-neutral-500">
                          O texto ficará oculto até a pessoa escolher mostrar.
                        </span>
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse gap-2 border-white/10 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 w-full cursor-pointer rounded-xl border border-white/10 px-4 font-medium text-neutral-300 text-xs transition-colors hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-white px-5 font-bold text-black text-xs shadow-md transition-colors hover:bg-neutral-200 disabled:opacity-50 sm:w-auto"
                >
                  <Send className="size-3 text-black" />
                  <span>
                    {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Publicar'}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
