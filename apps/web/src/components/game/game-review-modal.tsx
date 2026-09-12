'use client';

import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Clock,
  Gamepad2,
  Monitor,
  Plus,
  Send,
  Smartphone,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { type Game, type GameReview, submitGameReview } from '@/lib/games';
import { PixelHeart } from '@/components/landing/pixel-heart';

interface GameReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  initialReview?: GameReview | null;
  onReviewCreated?: (review: GameReview) => void;
  onReviewDeleted?: (reviewId: string) => void;
}

function getPlatformIcon(name: string) {
  const lower = name.toLowerCase();
  if (
    lower.includes('pc') ||
    lower.includes('windows') ||
    lower.includes('mac') ||
    lower.includes('linux') ||
    lower.includes('steam')
  ) {
    return <Monitor className="size-3.5" />;
  }
  if (lower.includes('ios') || lower.includes('android')) {
    return <Smartphone className="size-3.5" />;
  }
  return <Gamepad2 className="size-3.5" />;
}

function TopScreenRating({
  game,
  rating,
  onRatingChange
}: {
  game: Game;
  rating: number;
  onRatingChange: (val: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const activeRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#050505] p-3.5 shadow-inner sm:p-4">
      {/* Scanline CRT Ambient Background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px]" />

      {/* Game Header */}
      <div className="relative z-10 flex items-center gap-3">
        {/* Floating Game Cover */}
        <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-neutral-950 shadow-xl sm:w-14">
          {game.coverUrl ? (
            <img src={game.coverUrl} alt={game.name} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-neutral-600">
              <Gamepad2 className="size-4" />
            </div>
          )}
        </div>

        {/* Game Title & Details */}
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] text-neutral-400">
            {game.developer || game.publisher || 'Jogo'} {game.releaseYear ? `• ${game.releaseYear}` : ''}
          </span>
          <h3 className="truncate font-redaction text-base sm:text-lg font-bold tracking-tight text-white">
            {game.name}
          </h3>
        </div>

        {/* Score Pill in Top Right */}
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/[0.1] px-3 py-1">
          <PixelHeart size={14} variant="full" color="#EF4444" />
          <span className="font-mono text-base font-bold text-white tracking-tight">
            {activeRating.toFixed(1)}
          </span>
          <span className="font-mono text-[11px] text-neutral-500">/ 5.0</span>
        </div>
      </div>

      {/* The 5 Red 8-Bit Pixel Hearts */}
      <div
        className="relative z-10 mt-3 flex items-center justify-center gap-2 select-none py-1.5 sm:gap-3"
        onMouseLeave={() => setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((heartIndex) => {
          const isFull = activeRating >= heartIndex;
          const isHalf = !isFull && activeRating >= heartIndex - 0.5;
          const currentVariant: 'full' | 'half' | 'empty' = isFull
            ? 'full'
            : isHalf
            ? 'half'
            : 'empty';

          const isFocusedHeart =
            hoverRating !== null &&
            (heartIndex === Math.ceil(hoverRating) || (hoverRating === 0.5 && heartIndex === 1));

          const isFilled = currentVariant !== 'empty';

          return (
            <div
              key={heartIndex}
              style={isFilled ? { filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' } : undefined}
              className={`relative cursor-pointer p-1 select-none transition-transform duration-[50ms] ease-out will-change-transform ${
                isFocusedHeart ? 'scale-110 -translate-y-px' : 'scale-100'
              }`}
            >
              <PixelHeart
                size={38}
                variant={currentVariant}
                color="#EF4444"
                className={`pointer-events-none ${isFilled ? 'opacity-100' : 'opacity-25'}`}
              />

              {/* Exact Split Hitboxes for Half (x.5) and Full (x.0) */}
              <div className="absolute inset-0 flex z-20">
                <button
                  type="button"
                  aria-label={`${heartIndex - 0.5} corações`}
                  className="w-1/2 h-full cursor-pointer focus:outline-hidden"
                  onMouseEnter={() => setHoverRating(heartIndex - 0.5)}
                  onClick={() => onRatingChange(heartIndex - 0.5)}
                />
                <button
                  type="button"
                  aria-label={`${heartIndex} corações`}
                  className="w-1/2 h-full cursor-pointer focus:outline-hidden"
                  onMouseEnter={() => setHoverRating(heartIndex)}
                  onClick={() => onRatingChange(heartIndex)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GameReviewModal({
  isOpen,
  onClose,
  game,
  initialReview,
  onReviewCreated,
  onReviewDeleted
}: GameReviewModalProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [rating, setRating] = useState<number>(initialReview?.rating || 5);
  const [reviewText, setReviewText] = useState(initialReview?.reviewText || '');
  const [containsSpoiler, setContainsSpoiler] = useState(initialReview?.containsSpoiler ?? false);
  const [selectedPlatform, setSelectedPlatform] = useState(
    initialReview?.platform || game.platforms?.[0] || ''
  );
  const [hoursPlayed, setHoursPlayed] = useState(initialReview?.hoursPlayed || '');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visitors CANNOT review: redirect immediately to login/register
  useEffect(() => {
    if (isOpen && !currentUser) {
      toast.info('Você precisa entrar ou criar uma conta para avaliar jogos.');
      onClose();
      router.push(`/auth?redirect=/games/${game.slug}`);
    }
  }, [isOpen, currentUser, game.slug, router, onClose]);

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

  const isEditing = Boolean(initialReview);

  // Add user custom tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!customTags.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Você precisa entrar ou criar uma conta para publicar uma avaliação.');
      onClose();
      router.push(`/auth?redirect=/games/${game.slug}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewUser = {
        id: currentUser.id,
        username: currentUser.username,
        displayName: currentUser.displayName || currentUser.username,
        avatarUrl: currentUser.avatarUrl
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
      }

      // Always save to localStorage to ensure instant client sync across profile & game tabs
      if (typeof window !== 'undefined' && updatedReview) {
        try {
          const stored = localStorage.getItem(`local_reviews_${game.slug}`) || '[]';
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

          const existingMeta = JSON.parse(localStorage.getItem(`game_meta_${game.slug}`) || '{}');
          const gameMeta = {
            ...existingMeta,
            id: game.slug,
            title: game.name,
            coverUrl: game.coverUrl || game.bannerUrl || existingMeta.coverUrl || '',
            backdropUrl: game.bannerUrl || existingMeta.backdropUrl || '',
            year: game.firstReleaseDate ? new Date(game.firstReleaseDate).getFullYear().toString() : existingMeta.year || '',
            developer: game.developer || existingMeta.developer || '',
            genres: game.genres || existingMeta.genres || [],
            status: existingMeta.status || 'Jogado',
            rating: updatedReview.rating,
            platformTag: updatedReview.platform || game.platforms?.[0] || existingMeta.platformTag
          };
          localStorage.setItem(`game_meta_${game.slug}`, JSON.stringify(gameMeta));

          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('joysticked:review-updated', { detail: updatedReview }));
        } catch {}
      }

      onReviewCreated?.(updatedReview);
      onClose();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#EF4444', '#FFFFFF', '#222222', '#F87171']
      });

      toast.success(
        isEditing ? 'Avaliação atualizada com sucesso!' : 'Avaliação registrada com sucesso!'
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
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('joysticked:review-updated', { detail: { id: initialReview.id, deleted: true } }));
      } catch {}
    }
    onReviewDeleted?.(initialReview.id);
    onClose();
    toast.info('Avaliação removida.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card - 3DS Handheld Dual-Screen Console */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="scrollbar-none relative z-10 max-h-[92vh] w-full max-w-lg overflow-hidden overflow-y-auto rounded-[32px] border-2 border-white/15 bg-[#0C0C0C] p-3 sm:p-4.5 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(239,68,68,0.12)]"
          >
            {/* Top Console Shoulder Bar: [L] Bumper, Power LED & [R] Close Bumper */}
            <div className="relative mb-2.5 flex select-none items-center justify-between px-1">
              {/* [ L ] Bumper */}
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold text-neutral-400">
                <span className="text-white">L</span>
                <span className="text-neutral-500">//</span>
                <span>REVIEW</span>
              </div>

              {/* Console Center Status LED & Brand */}
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="font-mono text-[10px] font-bold text-neutral-400 tracking-wider">
                  JOYSTICKED-3DS
                </span>
              </div>

              {/* [ R ] Bumper & Close Action */}
              <div className="flex items-center gap-1.5">
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    title="Excluir Avaliação"
                    className="cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-400 text-xs transition-colors hover:bg-red-500/20"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="group flex cursor-pointer select-none items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold text-neutral-300 transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
                >
                  <span>FECHAR</span>
                  <span className="text-neutral-500">//</span>
                  <span className="text-white">R</span>
                  <X className="size-3 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>

            {/* =========================================================================
                TOP SCREEN: 3DS Widescreen Display (Game Info & 8-Bit Pixel Hearts)
               ========================================================================= */}
            <TopScreenRating game={game} rating={rating} onRatingChange={setRating} />

            {/* =========================================================================
                CONSOLE HINGE SEAM: 3DS Hinge Groove
               ========================================================================= */}
            <div className="relative my-2.5 flex select-none items-center justify-between px-2">
              <div className="h-1.5 w-8 rounded-full border border-white/15 bg-neutral-800" />
              <div className="h-0.5 w-full mx-3 bg-white/[0.08]" />
              <div className="h-1.5 w-8 rounded-full border border-white/15 bg-neutral-800" />
            </div>

            {/* =========================================================================
                BOTTOM SCREEN: Touch Screen / Action Deck
               ========================================================================= */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative rounded-2xl border border-white/15 bg-[#080808] p-3.5 sm:p-4 shadow-inner">
                {/* Touch Screen Dot-Matrix Texture */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[size:16px_16px]" />

                <div className="relative z-10 space-y-3">
                  {/* Platforms (Strictly from game.platforms) */}
                  {game.platforms && game.platforms.length > 0 && (
                    <div>
                      <span className="mb-1.5 block font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Plataforma jogada
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {game.platforms.map((p) => {
                          const isSelected = selectedPlatform === p;
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSelectedPlatform(isSelected ? '' : p)}
                              className={`inline-flex cursor-pointer select-none items-center gap-1 rounded-lg border px-2 py-1 font-mono text-[10.5px] transition-all ${
                                isSelected
                                  ? 'border-white bg-white font-bold text-black shadow-sm'
                                  : 'border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white'
                              }`}
                            >
                              {getPlatformIcon(p)}
                              <span>{p}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom User Tags (User can add tags freely) */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        <Tag className="size-3 text-red-400" />
                        <span>Tags da sua resenha</span>
                      </div>
                      <span className="font-mono text-[9px] text-neutral-500">
                        {customTags.length} adicionadas
                      </span>
                    </div>

                    {/* Tag input bar */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Digite uma tag (ex: gameplay, chefes, história) e tecle Enter..."
                        className="h-8 flex-1 rounded-xl border border-white/10 bg-black/60 px-3 font-mono text-white text-xs transition-colors placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-xl border border-white/10 bg-white/[0.05] px-2.5 font-mono text-xs text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Plus className="size-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>

                    {/* Custom Tag Chips */}
                    {customTags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {customTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[11px] text-red-300"
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="cursor-pointer text-red-400 hover:text-white transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Playtime Input */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Tempo de jogo (opcional)
                      </span>
                      {/* Presets */}
                      <div className="flex items-center gap-1 font-mono text-[9px]">
                        {['10h', '25h', '50h', '80h+'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setHoursPlayed(preset)}
                            className="cursor-pointer rounded bg-white/[0.05] px-1.5 py-0.5 text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <Clock className="-translate-y-1/2 absolute top-1/2 left-2.5 size-3.5 text-neutral-500" />
                      <input
                        type="text"
                        value={hoursPlayed}
                        onChange={(e) => setHoursPlayed(e.target.value)}
                        placeholder="Ex: 48 horas jogadas"
                        className="h-8 w-full rounded-xl border border-white/10 bg-black/60 pr-3 pl-8 font-mono text-white text-xs transition-colors placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Review Textarea */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="modal-review-text"
                        className="font-mono text-[10px] font-bold text-neutral-400 uppercase tracking-wider"
                      >
                        Sua opinião
                      </label>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {reviewText.length}/500
                      </span>
                    </div>

                    <textarea
                      id="modal-review-text"
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="O que você achou do jogo? Jogabilidade, história, chefes, arte..."
                      maxLength={500}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-white text-xs leading-relaxed transition-colors placeholder:text-neutral-600 focus:border-white/30 focus:outline-hidden"
                    />

                    {/* Spoiler Toggle */}
                    <label className="mt-1.5 flex cursor-pointer select-none items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-3 py-1.5 transition-colors hover:bg-amber-500/[0.08]">
                      <input
                        type="checkbox"
                        checked={containsSpoiler}
                        onChange={(e) => setContainsSpoiler(e.target.checked)}
                        className="size-3.5 accent-amber-400 cursor-pointer"
                      />
                      <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
                      <span className="font-mono text-[11px] text-amber-200">
                        Esta resenha contém spoilers
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Console Lower Controls: [SELECT] Cancel & [START] Publish */}
              <div className="flex select-none items-center justify-between pt-1">
                {/* Micro D-Pad Graphic Accent */}
                <div className="flex items-center gap-2 font-mono text-[9px] text-neutral-600">
                  <div className="relative size-5 opacity-30">
                    <div className="absolute inset-x-1.5 inset-y-0 bg-white rounded-xs" />
                    <div className="absolute inset-y-1.5 inset-x-0 bg-white rounded-xs" />
                  </div>
                  <span className="hidden sm:inline">JOYSTICKED-SYS</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-8.5 cursor-pointer items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3.5 font-mono text-neutral-400 text-xs transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <span>CANCELAR</span>
                    <span className="text-neutral-600 font-bold text-[10px]">[SELECT]</span>
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-8.5 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 font-mono text-xs font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:bg-neutral-200 disabled:opacity-50"
                  >
                    <PixelHeart size={12} variant="full" color="#EF4444" />
                    <span>
                      {isSubmitting
                        ? 'SALVANDO...'
                        : isEditing
                        ? 'SALVAR'
                        : 'PUBLICAR'}
                    </span>
                    <span className="rounded bg-black/10 px-1 py-0.2 font-mono text-[9px] font-bold text-black/70">
                      START
                    </span>
                    <Send className="size-3 text-black" />
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
