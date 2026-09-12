/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import {
  BookmarkPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Gamepad2,
  PenLine,
  Plus,
  Star,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  CopyLinkMicroButton,
  FavoriteMicroButton,
  ReviewMicroButton
} from '@/components/ui/micro-button';
import { PixelHeart } from '@/components/landing/pixel-heart';
import type { Game, GameReview } from '@/lib/games';

interface GameHeroProps {
  game: Game;
  onOpenReviewModal: () => void;
  bannerUrl?: string | null;
  communityRating?: { average: string; count: number };
  userReview?: GameReview | null;
}

export function GameHero({
  game,
  onOpenReviewModal,
  bannerUrl,
  communityRating,
  userReview
}: GameHeroProps) {
  const [inCollection, setInCollection] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [isCollectionHovered, setIsCollectionHovered] = useState(false);

  // Use custom selected banner, IGDB banner, or fallback to cover
  const bannerImage = bannerUrl || game.bannerUrl || game.coverUrl;

  const posterImage = game.coverUrl || game.bannerUrl;

  const handleStatusSelect = (status: string, label: string) => {
    if (collectionStatus === status) {
      setInCollection(false);
      setCollectionStatus(null);
      setShowStatusMenu(false);
      toast.info(`"${game.name}" removido da sua lista.`);

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`game_status_${game.slug}`);
          localStorage.removeItem(`game_meta_${game.slug}`);
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('joysticked:review-updated', { detail: { slug: game.slug, removed: true } }));
        } catch {}
      }
    } else {
      setInCollection(true);
      setCollectionStatus(status);
      setShowStatusMenu(false);
      toast.success(`"${game.name}" marcado como "${label}"!`);

      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('joysticked_played_games') || '[]');
          if (!stored.includes(game.slug)) {
            localStorage.setItem('joysticked_played_games', JSON.stringify([game.slug, ...stored]));
          }
          localStorage.setItem(`game_status_${game.slug}`, status);

          const gameMeta = {
            id: game.slug,
            title: game.name,
            coverUrl: game.coverUrl || game.bannerUrl || '',
            backdropUrl: game.bannerUrl || '',
            year: game.firstReleaseDate ? new Date(game.firstReleaseDate).getFullYear().toString() : '',
            developer: game.developer || '',
            genres: game.genres || [],
            status: status,
            rating: userReview?.rating,
            platformTag: game.platforms?.[0]
          };
          localStorage.setItem(`game_meta_${game.slug}`, JSON.stringify(gameMeta));

          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('joysticked:review-updated', { detail: gameMeta }));
        } catch {}
      }
    }
  };

  const toggleFavorite = (_e: React.MouseEvent) => {
    const next = !isFavorite;
    setIsFavorite(next);
    if (next) {
      toast.success(`"${game.name}" adicionado aos favoritos!`, {
        icon: '🤍'
      });
    } else {
      toast.info('Removido dos favoritos');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const formattedDate = game.firstReleaseDate
    ? new Date(game.firstReleaseDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : game.releaseYear || null;

  return (
    <div className="relative w-full">
      {/* Cinematic Banner Background */}
      <div className="relative mx-auto h-52 w-full max-w-5xl overflow-hidden bg-[#08080a] sm:h-64 md:h-72 lg:h-80">
        {bannerImage ? (
          <>
            <img
              src={bannerImage}
              alt={game.name}
              className="h-full w-full object-cover object-center brightness-90 transition-transform duration-500 hover:scale-105"
            />
            {/* Top Vignette */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#08080a]/80 via-[#08080a]/40 to-transparent" />

            {/* Seamless Bottom Fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#08080a] via-[#08080a]/90 to-transparent sm:h-52 md:h-60" />

            {/* Edge Vignettes */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08080a]/50 via-transparent to-[#08080a]/50" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-neutral-900 to-[#08080a]" />
        )}
      </div>

      {/* Main Content Info overlapping the banner */}
      <div className="-mt-14 sm:-mt-20 md:-mt-24 relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
          {/* Overlapping Poster on the Left */}
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', duration: 0.24, bounce: 0 }}
            className="mx-auto w-24 flex-shrink-0 sm:w-28 md:mx-0 md:w-32"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-[0_16px_36px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
              {posterImage ? (
                <img src={posterImage} alt={game.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-600">
                  <Gamepad2 className="size-8" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Details Stack */}
          <div className="flex-1 space-y-3.5 pt-0 sm:pt-2">
            {/* Release Date & Developer */}
            <div className="flex items-center gap-2 font-medium text-neutral-400 text-xs tracking-tight">
              {formattedDate && <span>{formattedDate}</span>}
              {game.developer && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-300">{game.developer}</span>
                </>
              )}
            </div>

            {/* Title with Geist Sans */}
            <h1 className="font-sans font-bold text-3xl text-white tracking-tight sm:text-4xl md:text-5xl [text-wrap:balance]">
              {game.name}
            </h1>

            {/* Genres, Score & Rating Row */}
            <div className="flex flex-wrap items-center gap-2">
              {game.genres?.map((genre) => (
                <span
                  key={genre}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs font-medium tracking-tight text-neutral-300"
                >
                  {genre}
                </span>
              ))}

              {/* IGDB Score */}
              {(game.rating || game.aggregatedRating) && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <Star className="size-3 fill-white text-white" />
                  <span className="font-mono">{(game.rating || game.aggregatedRating)?.toFixed(1)}</span>
                  <span className="text-[10px] font-normal text-neutral-400">IGDB</span>
                </span>
              )}

              {/* Community Review Tag */}
              {communityRating && communityRating.count > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-neutral-200">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="font-mono font-bold text-white">{communityRating.average}</span>
                  <span className="text-[10px] text-neutral-400">
                    ({communityRating.count}{' '}
                    {communityRating.count === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </span>
              )}
            </div>

            {/* Description / Synopsis */}
            {game.summary && (
              <div className="max-w-2xl text-neutral-300 text-xs leading-relaxed sm:text-sm [text-wrap:pretty]">
                <p className={!expandedSummary ? 'line-clamp-3' : ''}>{game.summary}</p>
                {game.summary.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="mt-1.5 inline-flex cursor-pointer items-center gap-1 font-medium text-neutral-400 text-xs transition-colors hover:text-white active:scale-95"
                  >
                    <span>{expandedSummary ? 'Mostrar menos' : 'Ler mais'}</span>
                    {expandedSummary ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
              {/* Collection Dropdown Button */}
              <div className="relative">
                <motion.button
                  type="button"
                  onMouseEnter={() => setIsCollectionHovered(true)}
                  onMouseLeave={() => setIsCollectionHovered(false)}
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  whileTap={{ scale: 0.96 }}
                  className={`relative inline-flex h-9 cursor-pointer select-none items-center justify-center rounded-full border px-4 font-medium text-xs backdrop-blur-md transition-all ${
                    inCollection
                      ? 'border-white/30 bg-white/15 text-white shadow-[0_2px_12px_rgba(255,255,255,0.1)]'
                      : 'border-white/15 bg-white/[0.04] text-neutral-300 hover:border-white/25 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="relative flex size-3.5 shrink-0 items-center justify-center">
                    {inCollection ? (
                      <Check className="size-3.5 text-white" />
                    ) : (
                      <Plus className="size-3.5 text-neutral-400" />
                    )}
                  </div>
                  <span className="ml-2 whitespace-nowrap tracking-tight">
                    {collectionStatus || 'Adicionar à lista'}
                  </span>
                  <span className="ml-1.5 text-[10px] text-neutral-500">▾</span>
                </motion.button>

                <AnimatePresence>
                  {showStatusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
                      className="absolute top-11 left-0 z-30 min-w-[190px] overflow-hidden rounded-2xl border border-white/15 bg-[#0e0e11]/95 p-1.5 shadow-2xl backdrop-blur-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => handleStatusSelect('Jogando', 'Jogando')}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          collectionStatus === 'Jogando'
                            ? 'bg-white/15 font-medium text-white'
                            : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-neutral-400" />
                          <span>Jogando</span>
                        </div>
                        {collectionStatus === 'Jogando' && <Check className="size-3 text-white" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusSelect('Jogado', 'Jogado')}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          collectionStatus === 'Jogado'
                            ? 'bg-white/15 font-medium text-white'
                            : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-neutral-400" />
                          <span>Jogado / Concluído</span>
                        </div>
                        {collectionStatus === 'Jogado' && <Check className="size-3 text-white" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusSelect('Quero Jogar', 'Quero Jogar')}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                          collectionStatus === 'Quero Jogar'
                            ? 'bg-white/15 font-medium text-white'
                            : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookmarkPlus className="size-3.5 text-neutral-400" />
                          <span>Quero Jogar</span>
                        </div>
                        {collectionStatus === 'Quero Jogar' && (
                          <Check className="size-3 text-white" />
                        )}
                      </button>

                      {inCollection && (
                        <div className="mt-1 border-white/10 border-t pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setInCollection(false);
                              setCollectionStatus(null);
                              setShowStatusMenu(false);
                              toast.info(`"${game.name}" removido da sua lista.`);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[11px] text-neutral-400 transition-colors hover:bg-white/10 hover:text-rose-300"
                          >
                            <X className="size-3" />
                            <span>Remover da lista</span>
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 1. REVIEW BUTTON */}
              {userReview ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={onOpenReviewModal}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 font-semibold text-white text-xs backdrop-blur-md transition-colors hover:bg-red-500/20"
                >
                  <PixelHeart size={14} variant="full" color="#EF4444" />
                  <span className="font-mono">Sua Nota: {Number(userReview.rating).toFixed(1)}</span>
                  <PenLine className="ml-0.5 size-3 text-neutral-400" />
                </motion.button>
              ) : (
                <ReviewMicroButton onClick={onOpenReviewModal} />
              )}

              {/* 2. FAVORITE BUTTON */}
              <FavoriteMicroButton isFavorite={isFavorite} onToggle={toggleFavorite} />

              {/* 3. COPY LINK BUTTON */}
              <CopyLinkMicroButton onCopy={handleCopyLink} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
