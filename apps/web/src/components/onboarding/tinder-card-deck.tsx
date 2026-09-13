/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { Check, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type DiscoveryGame = {
  id: string;
  title: string;
  year: string;
  developer: string;
  coverUrl: string;
  genres: string[];
};

export const DEFAULT_DISCOVERY_GAMES: DiscoveryGame[] = [
  {
    id: 'elden-ring',
    title: 'Elden Ring',
    year: '2022',
    developer: 'FromSoftware',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co4jni.webp',
    genres: ['Action RPG', 'Souls-like']
  },
  {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    year: '2023',
    developer: 'Larian Studios',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co670h.webp',
    genres: ['RPG', 'Turn-Based']
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    year: '2020',
    developer: 'CD Projekt RED',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co8v0m.webp',
    genres: ['Action RPG', 'Open World']
  },
  {
    id: 'zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    year: '2023',
    developer: 'Nintendo',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co5vmg.webp',
    genres: ['Ação e Aventura', 'Mundo Aberto']
  },
  {
    id: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    year: '2022',
    developer: 'Santa Monica Studio',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/co5s5v.webp',
    genres: ['Ação e Aventura', 'Mitologia']
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    year: '2017',
    developer: 'Team Cherry',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big_2x/cobfzp.webp',
    genres: ['Metroidvania', 'Indie']
  }
];

function SwipeableCard({
  game,
  onSwipe,
  isTop
}: {
  game: DiscoveryGame;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 75], [0, 1]);
  const passOpacity = useTransform(x, [-20, -75], [0, 1]);

  const handleDragEnd = (
    _: any,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const threshold = 75;
    const velocityThreshold = 300;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  if (!isTop) {
    return null;
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden rounded-[20px] bg-[#18181b] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] ring-1 ring-white/[0.1] active:cursor-grabbing"
    >
      {/* Game Cover */}
      <img
        src={game.coverUrl}
        alt={game.title}
        className="pointer-events-none h-full w-full object-cover"
        draggable={false}
      />

      {/* Atmospheric Vignette Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

      {/* Swipe Feedback Stamp: LIKE (Right) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-3.5 left-3.5 rotate-[-6deg] rounded-lg bg-white px-2.5 py-1 text-black font-semibold shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
          <ThumbsUp className="size-3" strokeWidth={2.5} />
          <span>Curti</span>
        </div>
      </motion.div>

      {/* Swipe Feedback Stamp: PASS (Left) */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="pointer-events-none absolute top-3.5 right-3.5 rotate-[6deg] rounded-lg bg-zinc-800/90 px-2.5 py-1 text-zinc-200 font-semibold ring-1 ring-white/15 backdrop-blur-md"
      >
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider">
          <ThumbsDown className="size-3" strokeWidth={2.5} />
          <span>Pular</span>
        </div>
      </motion.div>

      {/* Card Details Footer */}
      <div className="pointer-events-none absolute right-4 bottom-4 left-4 text-left">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
          <span>{game.year}</span>
          <span>•</span>
          <span className="truncate">{game.developer}</span>
        </div>

        <h3 className="mt-0.5 font-redaction font-medium text-lg text-white leading-snug tracking-tight">
          {game.title}
        </h3>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {game.genres.map((g) => (
            <span
              key={g}
              className="rounded-md bg-white/[0.08] px-2 py-0.5 font-medium text-[9px] text-zinc-200 ring-1 ring-white/[0.08] backdrop-blur-sm"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TinderCardDeck({
  games = DEFAULT_DISCOVERY_GAMES,
  onFinish,
  onRate
}: {
  games?: DiscoveryGame[];
  onFinish: (likedIds: string[]) => void;
  onRate?: (gameId: string, liked: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const currentGame = games[currentIndex];
  const nextGame = games[currentIndex + 1];
  const isFinished = currentIndex >= games.length;

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isFinished || !currentGame) return;

    setSwipeDirection(direction);
    const isLiked = direction === 'right';

    if (isLiked) {
      setLikedIds((prev) => [...prev, currentGame.id]);
    }

    onRate?.(currentGame.id, isLiked);

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSwipeDirection(null);
    }, 60);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedIds([]);
  };

  return (
    <div className="relative flex flex-col items-center gap-3">
      {!isFinished ? (
        <>
          {/* Card Stack */}
          <div className="relative aspect-[3/4] w-56 select-none sm:w-60">
            {/* Background Preview Card */}
            {nextGame && (
              <div className="pointer-events-none absolute inset-0 translate-y-2 scale-[0.96] overflow-hidden rounded-[20px] bg-[#18181b] opacity-35 ring-1 ring-white/[0.08] transition-transform duration-200 ease-out">
                <img
                  src={nextGame.coverUrl}
                  alt={nextGame.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            )}

            {/* Top Interactive Card */}
            <AnimatePresence mode="wait">
              {currentGame && (
                <motion.div
                  key={currentGame.id}
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    x: swipeDirection === 'right' ? 280 : swipeDirection === 'left' ? -280 : 0,
                    opacity: 0,
                    rotate: swipeDirection === 'right' ? 14 : swipeDirection === 'left' ? -14 : 0,
                    transition: { duration: 0.16, ease: 'easeIn' }
                  }}
                  className="absolute inset-0"
                >
                  <SwipeableCard game={currentGame} onSwipe={handleSwipe} isTop={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clean Tactile Floating Controls */}
          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => handleSwipe('left')}
              className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
              title="Pular"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
              {games.length - currentIndex} restantes
            </span>

            <button
              type="button"
              onClick={() => handleSwipe('right')}
              className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
              title="Gostei"
            >
              <ThumbsUp className="size-4" strokeWidth={2} />
            </button>
          </div>
        </>
      ) : (
        /* Finished State */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', duration: 0.28, bounce: 0 }}
          className="flex flex-col items-center gap-4 py-4 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-white ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            <Sparkles className="size-6 text-white" />
          </div>

          <div className="space-y-1">
            <h3 className="font-redaction font-medium text-xl text-white">
              Tudo pronto!
            </h3>
            <p className="max-w-xs text-xs text-zinc-400 [text-wrap:pretty]">
              {likedIds.length} título{likedIds.length !== 1 ? 's' : ''} salvo{likedIds.length !== 1 ? 's' : ''} nas suas preferências.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 rounded-xl border-0 bg-white/[0.04] px-3 text-xs text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.08] active:scale-[0.96]"
            >
              <RotateCcw className="mr-1.5 size-3" />
              Revisar
            </Button>
            <Button
              size="sm"
              onClick={() => onFinish(likedIds)}
              className="h-9 rounded-xl bg-white px-4 text-xs font-medium text-black hover:bg-zinc-200 active:scale-[0.96]"
            >
              <Check className="mr-1.5 size-3.5" strokeWidth={2.5} />
              Concluir
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
