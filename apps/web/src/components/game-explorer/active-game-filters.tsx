'use client';

import { X } from 'lucide-react';

interface ActiveGameFiltersProps {
  genre: string;
  platform: string;
  minimumScore: number;
  mode: string;
  onGenreReset: () => void;
  onPlatformReset: () => void;
  onScoreReset: () => void;
  onModeReset: () => void;
}

export function ActiveGameFilters({
  genre,
  platform,
  minimumScore,
  mode,
  onGenreReset,
  onPlatformReset,
  onScoreReset,
  onModeReset
}: ActiveGameFiltersProps) {
  const chipClass =
    'inline-flex items-center gap-1 rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10.5px] text-white transition-colors hover:bg-white/[0.12]';

  return (
    <>
      {genre !== 'Todos' && (
        <FilterChip label={genre} onReset={onGenreReset} className={chipClass} />
      )}
      {platform !== 'Todas' && (
        <FilterChip label={platform} onReset={onPlatformReset} className={chipClass} />
      )}
      {minimumScore > 0 && (
        <FilterChip
          label={`Nota ${minimumScore.toFixed(1)}+`}
          onReset={onScoreReset}
          className={chipClass}
        />
      )}
      {mode !== 'Todos' && <FilterChip label={mode} onReset={onModeReset} className={chipClass} />}
    </>
  );
}

function FilterChip({
  label,
  onReset,
  className
}: {
  label: string;
  onReset: () => void;
  className: string;
}) {
  return (
    <button type="button" onClick={onReset} className={className}>
      <span>{label}</span>
      <X className="size-3 text-neutral-400" />
    </button>
  );
}
