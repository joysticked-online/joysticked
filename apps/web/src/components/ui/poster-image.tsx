'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PosterImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function PosterImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = '',
  sizes = '(max-width: 768px) 33vw, 150px',
  priority = false
}: PosterImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex size-full select-none items-center justify-center bg-neutral-900 p-2 text-center font-medium text-[10px] text-neutral-500">
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative size-full overflow-hidden bg-neutral-900">
      {/* Skeleton Shimmer Pulse Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-neutral-800/80" aria-hidden="true">
          <div className="h-full w-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>
      )}

      {/* Actual Poster Image with Smooth Fade-in */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        unoptimized={src.includes('steamstatic') || src.includes('images.igdb.com')}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`object-cover transition-all duration-300 ${
          isLoaded ? 'scale-100 opacity-100' : 'scale-98 opacity-0'
        } ${className}`}
      />
    </div>
  );
}
