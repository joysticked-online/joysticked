'use client';

import { useState } from 'react';

export interface PixelHeartProps {
  size?: number;
  variant?: 'full' | 'half' | 'empty';
  color?: string;
  emptyColor?: string;
  className?: string;
}

/**
 * 8-Bit Pixel Heart supporting Full, Half (Middle Heart), and Empty states.
 * Designed on a 24x24 pixel grid.
 */
export function PixelHeart({
  size = 24,
  variant = 'full',
  color = '#EF4444', // Red-500 / crimson accent
  emptyColor = '#262626', // Sleek dark border for empty state
  className = ''
}: PixelHeartProps) {
  // Outline contour of the heart (common to all states)
  const outlineD =
    'M4 4h5v2H4V4zm11 0h5v2h-5V4zM2 6h2v5H2V6zm9 2h2v2h-2V8zm9-2h2v5h-2V6zM4 11h2v3H4v-3zm14 0h2v3h-2v-3zM6 14h2v3H6v-3zm10 0h2v3h-2v-3zM8 17h2v3H8v-3zm6 0h2v3h-2v-3zm-4 3h4v2h-4v-2z';

  // Left half fill (x <= 12)
  const leftFillD =
    'M4 6h5v5H4V6zm5 2h3v3H9V8zm-5 3h4v3H4v-3zm4 0h4v3H8v-3zm-2 3h4v3H6v-3zm2 3h4v3H8v-3zm2 3h2v2h-2v-2z';

  // Right half fill (x > 12)
  const rightFillD =
    'M15 6h5v5h-5V6zm-3 2h3v3h-3V8zm3 3h4v3h-4v-3zm-3 0h4v3h-4v-3zm2 3h4v3h-4v-3zm-2 3h4v3h-4v-3zm0 3h2v2h-2v-2z';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Outer Contour */}
      <path
        d={outlineD}
        fill={variant === 'empty' ? emptyColor : color}
        fillOpacity={variant === 'empty' ? 0.6 : 0.9}
      />

      {/* Fill depending on variant */}
      {variant === 'full' && (
        <>
          <path d={leftFillD} fill={color} />
          <path d={rightFillD} fill={color} />
          {/* Pixel Highlight (top-left glint) */}
          <path d="M5 7h2v2H5V7zm2 2h1v1H7V9z" fill="#FFFFFF" fillOpacity={0.85} />
        </>
      )}

      {variant === 'half' && (
        <>
          <path d={leftFillD} fill={color} />
          {/* Subtle dim fill for the right half to indicate empty middle */}
          <path d={rightFillD} fill={emptyColor} fillOpacity={0.25} />
          {/* Pixel Highlight on the active left side */}
          <path d="M5 7h2v2H5V7zm2 2h1v1H7V9z" fill="#FFFFFF" fillOpacity={0.85} />
        </>
      )}

      {variant === 'empty' && (
        <path d={`${leftFillD} ${rightFillD}`} fill={emptyColor} fillOpacity={0.15} />
      )}
    </svg>
  );
}

/**
 * Interactive 5-Heart Review Rating Bar
 * Allows picking 0.5 steps (Half Hearts and Full Hearts)
 */
export interface PixelHeartRatingPickerProps {
  value: number; // e.g. 4.5
  onChange?: (val: number) => void;
  max?: number;
  size?: number;
  interactive?: boolean;
}

export function PixelHeartRatingPicker({
  value,
  onChange,
  max = 5,
  size = 28,
  interactive = true
}: PixelHeartRatingPickerProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayVal = hoverValue !== null ? hoverValue : value;

  return (
    <div
      className="inline-flex select-none items-center gap-1.5"
      onMouseLeave={() => interactive && setHoverValue(null)}
    >
      {Array.from({ length: max }, (_, index) => {
        const heartNumber = index + 1;
        const isFull = displayVal >= heartNumber;
        const isHalf = !isFull && displayVal >= heartNumber - 0.5;
        const currentVariant: 'full' | 'half' | 'empty' = isFull
          ? 'full'
          : isHalf
            ? 'half'
            : 'empty';

        return (
          <div key={heartNumber} className="group/heart relative cursor-pointer">
            <PixelHeart
              size={size}
              variant={currentVariant}
              color="#EF4444"
              className="transition-transform duration-75 ease-out group-hover/heart:scale-110"
            />

            {/* Clickable transparent split overlays for half vs full */}
            {interactive && (
              <div className="absolute inset-0 flex">
                {/* Left Half (click for x.5) */}
                <button
                  type="button"
                  aria-label={`Avaliar ${heartNumber - 0.5} corações`}
                  className="z-10 h-full w-1/2 cursor-pointer focus:outline-none"
                  onMouseEnter={() => setHoverValue(heartNumber - 0.5)}
                  onClick={() => onChange?.(heartNumber - 0.5)}
                />
                {/* Right Half (click for x.0) */}
                <button
                  type="button"
                  aria-label={`Avaliar ${heartNumber} corações`}
                  className="z-10 h-full w-1/2 cursor-pointer focus:outline-none"
                  onMouseEnter={() => setHoverValue(heartNumber)}
                  onClick={() => onChange?.(heartNumber)}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
