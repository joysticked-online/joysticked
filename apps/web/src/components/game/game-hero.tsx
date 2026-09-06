'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Check,
  Plus,
  Clock,
  CheckCircle2,
  BookmarkPlus,
  Gamepad2,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import {
  FavoriteMicroButton,
  CopyLinkMicroButton,
  ReviewMicroButton
} from '@/components/ui/micro-button';
import { ADMIN_GAME_BANNERS } from '@/constants/admin-banners';
import type { Game } from '@/lib/games';

interface GameHeroProps {
  game: Game;
  onOpenReviewModal: () => void;
  bannerUrl?: string | null;
}

export function GameHero({ game, onOpenReviewModal, bannerUrl }: GameHeroProps) {
  const [inCollection, setInCollection] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [isCollectionHovered, setIsCollectionHovered] = useState(false);

  // Admin banner override, custom selected banner, or IGDB banner
  const bannerImage =
    bannerUrl ||
    ADMIN_GAME_BANNERS[game.slug] ||
    ADMIN_GAME_BANNERS[String(game.id)] ||
    game.bannerUrl ||
    game.coverUrl;

  const posterImage = game.coverUrl || game.bannerUrl;

  const handleStatusSelect = (status: string, label: string) => {
    if (collectionStatus === status) {
      // Toggle off / unselect
      setInCollection(false);
      setCollectionStatus(null);
      setShowStatusMenu(false);
      toast.info(`"${game.name}" removido da sua lista.`);
    } else {
      // Select
      setInCollection(true);
      setCollectionStatus(status);
      setShowStatusMenu(false);
      toast.success(`"${game.name}" marcado como "${label}"!`);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
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
      {/* Cinematic Banner Background (Clear, high-res & properly visible) */}
      <div className="relative mx-auto h-72 sm:h-84 md:h-[390px] w-full max-w-4xl overflow-hidden rounded-b-3xl bg-neutral-950">
        {bannerImage ? (
          <>
            <img
              src={bannerImage}
              alt={game.name}
              className="h-full w-full object-cover object-center brightness-90 transition-transform duration-700 hover:scale-105"
            />
            {/* Smooth bottom fade into black */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-neutral-900 to-neutral-950" />
        )}
      </div>

      {/* Main Content Info overlapping the banner */}
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 -mt-36 sm:-mt-44 md:-mt-52 z-10">
        <div className="flex flex-col md:flex-row gap-5 sm:gap-6 items-start">
          {/* Overlapping Poster on the Left (Compact size) */}
          <motion.div
            whileHover={{ y: -3, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-28 sm:w-36 md:w-38 flex-shrink-0 mx-auto md:mx-0"
          >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-[0_12px_32px_rgba(0,0,0,0.9)]">
              {posterImage ? (
                <img
                  src={posterImage}
                  alt={game.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-neutral-600">
                  <Gamepad2 className="size-8" />
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Details Stack */}
          <div className="flex-1 space-y-3 pt-0 sm:pt-2">
            {/* Release Date & Developer */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
              {formattedDate && <span>{formattedDate}</span>}
              {game.developer && (
                <>
                  <span>•</span>
                  <span className="text-neutral-300">{game.developer}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {game.name}
            </h1>

            {/* Genres & Score Row */}
            <div className="flex flex-wrap items-center gap-2">
              {game.genres?.map((genre) => (
                <span
                  key={genre}
                  className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-xs text-neutral-300"
                >
                  {genre}
                </span>
              ))}

              {(game.rating || game.aggregatedRating) && (
                <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-md">
                  <Star className="size-3 fill-white text-white" />
                  <span>{(game.rating || game.aggregatedRating)?.toFixed(1)}</span>
                  <span className="text-[10px] font-normal text-neutral-400">IGDB</span>
                </span>
              )}
            </div>

            {/* Description / Synopsis */}
            {game.summary && (
              <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                <p className={!expandedSummary ? 'line-clamp-3' : ''}>
                  {game.summary}
                </p>
                {game.summary.length > 200 && (
                  <button
                    type="button"
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>{expandedSummary ? 'Mostrar menos' : 'Ler mais'}</span>
                    {expandedSummary ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Collection Dropdown Button */}
              <div className="relative">
                <motion.button
                  type="button"
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onMouseEnter={() => setIsCollectionHovered(true)}
                  onMouseLeave={() => setIsCollectionHovered(false)}
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  whileTap={{ scale: 0.94 }}
                  animate={{
                    paddingLeft: isCollectionHovered ? 16 : 14,
                    paddingRight: isCollectionHovered ? 16 : 14,
                    backgroundColor: inCollection
                      ? 'rgba(255, 255, 255, 0.12)'
                      : isCollectionHovered
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.04)'
                  }}
                  className="relative inline-flex h-9 items-center justify-center rounded-full border border-white/15 text-xs font-medium text-neutral-200 backdrop-blur-md transition-colors duration-200 select-none cursor-pointer focus:outline-hidden"
                >
                  <div className="relative size-3.5 flex items-center justify-center shrink-0">
                    {inCollection ? (
                      <Check className="size-3.5 text-white" />
                    ) : (
                      <Plus className="size-3.5 text-neutral-400 group-hover:text-white" />
                    )}
                  </div>
                  <motion.span
                    layout
                    className={`ml-2 text-xs font-medium tracking-tight whitespace-nowrap transition-colors duration-200 ${
                      inCollection ? 'text-white font-semibold' : 'text-neutral-300'
                    }`}
                  >
                    {collectionStatus || 'Adicionar à lista'}
                  </motion.span>
                  <span className="ml-1 text-[10px] text-neutral-500">▾</span>
                </motion.button>

                <AnimatePresence>
                  {showStatusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      className="absolute top-11 left-0 z-30 min-w-[180px] overflow-hidden rounded-2xl border border-white/15 bg-neutral-900/95 p-1.5 shadow-2xl backdrop-blur-2xl"
                    >
                      <button
                        type="button"
                        onClick={() => handleStatusSelect('Jogando', 'Jogando')}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          collectionStatus === 'Jogando'
                            ? 'bg-white/15 text-white font-medium'
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          collectionStatus === 'Jogado'
                            ? 'bg-white/15 text-white font-medium'
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
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                          collectionStatus === 'Quero Jogar'
                            ? 'bg-white/15 text-white font-medium'
                            : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookmarkPlus className="size-3.5 text-neutral-400" />
                          <span>Quero Jogar</span>
                        </div>
                        {collectionStatus === 'Quero Jogar' && <Check className="size-3 text-white" />}
                      </button>

                      {inCollection && (
                        <div className="mt-1 pt-1 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => {
                              setInCollection(false);
                              setCollectionStatus(null);
                              setShowStatusMenu(false);
                              toast.info(`"${game.name}" removido da sua lista.`);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[11px] text-neutral-400 hover:bg-white/10 hover:text-rose-300 transition-colors cursor-pointer"
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

              {/* 1. REVIEW BUTTON (Amicro btn-30: Star Color-Morph) */}
              <ReviewMicroButton onClick={onOpenReviewModal} />

              {/* 2. FAVORITE BUTTON (Amicro btn-5: Heart Pulse & Fill) */}
              <FavoriteMicroButton isFavorite={isFavorite} onToggle={toggleFavorite} />

              {/* 3. COPY LINK BUTTON (Amicro btn-5 / btn-6: Morph Link -> Check) */}
              <CopyLinkMicroButton onCopy={handleCopyLink} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
