'use client';

import { Gamepad2, Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { PixelHeart } from '@/components/landing/pixel-heart';
import type { Game } from '@/lib/games';

export function getPlatformIcon(name: string) {
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

export function TopScreenRating({
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
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.2),transparent_70%)] opacity-30" />
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
            {game.developer || game.publisher || 'Jogo'}{' '}
            {game.releaseYear ? `• ${game.releaseYear}` : ''}
          </span>
          <h3 className="truncate font-bold font-sans text-base text-white tracking-tight sm:text-lg">
            {game.name}
          </h3>
        </div>

        {/* Score Pill in Top Right */}
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/[0.1] px-3 py-1">
          <PixelHeart size={14} variant="full" color="#EF4444" />
          <span className="font-bold font-mono text-base text-white tracking-tight">
            {activeRating.toFixed(1)}
          </span>
          <span className="font-mono text-[11px] text-neutral-500">/ 5.0</span>
        </div>
      </div>

      {/* The 5 Red 8-Bit Pixel Hearts */}
      <div
        className="relative z-10 mt-3 flex select-none items-center justify-center gap-2 py-1.5 sm:gap-3"
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
              className={`relative cursor-pointer select-none p-1 transition-transform duration-[50ms] ease-out will-change-transform ${
                isFocusedHeart ? '-translate-y-px scale-110' : 'scale-100'
              }`}
            >
              <PixelHeart
                size={38}
                variant={currentVariant}
                color="#EF4444"
                className={`pointer-events-none ${isFilled ? 'opacity-100' : 'opacity-25'}`}
              />

              {/* Exact Split Hitboxes for Half (x.5) and Full (x.0) */}
              <div className="absolute inset-0 z-20 flex">
                <button
                  type="button"
                  aria-label={`${heartIndex - 0.5} corações`}
                  className="h-full w-1/2 cursor-pointer focus:outline-hidden"
                  onMouseEnter={() => setHoverRating(heartIndex - 0.5)}
                  onClick={() => onRatingChange(heartIndex - 0.5)}
                />
                <button
                  type="button"
                  aria-label={`${heartIndex} corações`}
                  className="h-full w-1/2 cursor-pointer focus:outline-hidden"
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
