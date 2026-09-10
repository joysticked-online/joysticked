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
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    genres: ['Action RPG', 'Souls-like']
  },
  {
    id: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    year: '2023',
    developer: 'Larian Studios',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    genres: ['RPG', 'Turn-Based']
  },
  {
    id: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    year: '2020',
    developer: 'CD Projekt RED',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8v0m.webp',
    genres: ['Action RPG', 'Open World']
  },
  {
    id: 'zelda-totk',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    year: '2023',
    developer: 'Nintendo',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.webp',
    genres: ['Action-Adventure', 'Open World']
  },
  {
    id: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    year: '2022',
    developer: 'Santa Monica Studio',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.webp',
    genres: ['Action-Adventure', 'Mythology']
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    year: '2017',
    developer: 'Team Cherry',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co952f.webp',
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
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const passOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = (
    _: any,
    info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const threshold = 100;
    const velocityThreshold = 400;

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
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden rounded-3xl border border-border/80 bg-card shadow-2xl active:cursor-grabbing"
    >
      {/* Game Cover */}
      <img
        src={game.coverUrl}
        alt={game.title}
        className="pointer-events-none h-full w-full object-cover outline outline-1 outline-white/10 -outline-offset-1"
        draggable={false}
      />

      {/* Subtle Vignette Gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

      {/* Swipe Feedback Stamp: LIKE (Right) */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute top-6 left-6 rotate-[-12deg] rounded-xl border-2 border-emerald-500 bg-emerald-500/20 px-3 py-1 font-bold text-emerald-400 backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <ThumbsUp className="size-3.5" strokeWidth={2} />
          <span>Gostei</span>
        </div>
      </motion.div>

      {/* Swipe Feedback Stamp: PASS (Left) */}
      <motion.div
        style={{ opacity: passOpacity }}
        className="pointer-events-none absolute top-6 right-6 rotate-[12deg] rounded-xl border-2 border-rose-500 bg-rose-500/20 px-3 py-1 font-bold text-rose-400 backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <ThumbsDown className="size-3.5" strokeWidth={2} />
          <span>Pular</span>
        </div>
      </motion.div>

      {/* Game Details Card Footer */}
      <div className="pointer-events-none absolute right-5 bottom-5 left-5 text-left">
        <div className="flex items-center gap-2 font-medium text-[11px] text-white/70">
          <span>{game.year}</span>
          <span>•</span>
          <span>{game.developer}</span>
        </div>

        <h3 className="mt-1 font-bold font-redaction text-white text-xl leading-snug">
          {game.title}
        </h3>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {game.genres.map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/15 px-2.5 py-0.5 font-medium text-[10px] text-white/90 backdrop-blur-md"
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
    }, 150);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setLikedIds([]);
  };

  return (
    <div className="relative flex flex-col items-center gap-6">
      {!isFinished ? (
        <>
          {/* 3D Stack Container */}
          <div className="relative aspect-[3/4] w-72 select-none sm:w-80">
            {/* Background Preview Card (Next in queue) with Concentric Radius & Image Outline */}
            {nextGame && (
              <div className="pointer-events-none absolute inset-0 translate-y-3 scale-[0.93] overflow-hidden rounded-3xl border border-white/[0.08] bg-card opacity-60 shadow-lg transition-transform duration-300 ease-out">
                <img
                  src={nextGame.coverUrl}
                  alt={nextGame.title}
                  className="h-full w-full object-cover outline outline-1 outline-white/10 -outline-offset-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
            )}

            {/* Active Top Draggable Card */}
            <AnimatePresence mode="wait">
              {currentGame && (
                <motion.div
                  key={currentGame.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{
                    x: swipeDirection === 'right' ? 400 : swipeDirection === 'left' ? -400 : 0,
                    opacity: 0,
                    rotate: swipeDirection === 'right' ? 25 : swipeDirection === 'left' ? -25 : 0,
                    transition: { duration: 0.22, ease: 'easeIn' }
                  }}
                  className="absolute inset-0"
                >
                  <SwipeableCard game={currentGame} onSwipe={handleSwipe} isTop={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tinder-Style Floating Controls with 0.96 scale */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => handleSwipe('left')}
              className="group flex size-14 items-center justify-center rounded-full border border-white/[0.08] bg-card/90 text-rose-500 shadow-[0_0_0_1px_oklch(1_0_0/0.05),0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-150 ease-out hover:border-rose-500/40 hover:bg-rose-500/10 active:scale-[0.96]"
              title="Pular / Não joguei"
            >
              <X className="size-6 transition-transform group-hover:scale-110" strokeWidth={1.5} />
            </button>

            <div className="rounded-full border border-white/[0.08] bg-card/60 px-4 py-1.5 font-medium text-muted-foreground text-xs backdrop-blur-sm">
              <span>{games.length - currentIndex} jogos restantes</span>
            </div>

            <button
              type="button"
              onClick={() => handleSwipe('right')}
              className="group flex size-14 items-center justify-center rounded-full border border-white/[0.08] bg-card/90 text-emerald-500 shadow-[0_0_0_1px_oklch(1_0_0/0.05),0_8px_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-transform duration-150 ease-out hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-[0.96]"
              title="Já joguei / Gostei"
            >
              <ThumbsUp
                className="size-6 transition-transform group-hover:scale-110"
                strokeWidth={1.5}
              />
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Arraste para a direita para curtir ou para a esquerda para pular
          </p>
        </>
      ) : (
        /* Finished State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 py-8 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10 text-primary shadow-xl">
            <Sparkles className="size-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="font-bold font-redaction text-2xl text-foreground">
              Calibração Completa!
            </h3>
            <p className="max-w-xs text-muted-foreground text-xs">
              Você avaliou os jogos sugeridos. Seu perfil inicial está calibrado com{' '}
              {likedIds.length} jogo{likedIds.length !== 1 ? 's' : ''} favoritados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-xl text-xs"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Revisar
            </Button>
            <Button size="sm" onClick={() => onFinish(likedIds)} className="rounded-xl text-xs">
              <Check className="mr-1.5 size-3.5" />
              Continuar
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
