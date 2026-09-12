'use client';

import { Search, X } from 'lucide-react';
import { FilterSelect } from '@/components/game-explorer/filter-select';

interface GameFilterControlsProps {
  query: string;
  selectedGenre: string;
  selectedPlatform: string;
  minimumScore: number;
  selectedMode: string;
  genres: string[];
  platforms: string[];
  modes: string[];
  onQueryChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onMinimumScoreChange: (value: number) => void;
  onModeChange: (value: string) => void;
}

export function GameFilterControls({
  query,
  selectedGenre,
  selectedPlatform,
  minimumScore,
  selectedMode,
  genres,
  platforms,
  modes,
  onQueryChange,
  onGenreChange,
  onPlatformChange,
  onMinimumScoreChange,
  onModeChange
}: GameFilterControlsProps) {
  return (
    <div className="relative max-h-[min(68vh,520px)] space-y-3.5 overflow-y-auto pr-0.5">
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 size-3.5 text-neutral-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar pelo título exato..."
          className="h-9.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pr-8 pl-8 text-white text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all placeholder:text-neutral-500 hover:border-white/[0.16] hover:bg-white/[0.06] focus:border-white/25 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Limpar busca"
            className="absolute right-2.5 text-neutral-500 transition-colors hover:text-white"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      <FilterSelect
        label="Gênero"
        value={selectedGenre}
        options={genres}
        onChange={onGenreChange}
      />
      <FilterSelect
        label="Plataforma"
        value={selectedPlatform}
        options={platforms}
        onChange={onPlatformChange}
      />

      <div className="space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center justify-between">
          <label htmlFor="minimum-score" className="font-medium text-[11px] text-neutral-400">
            Nota mínima
          </label>
          <output
            htmlFor="minimum-score"
            className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-semibold text-[10px] text-white"
          >
            {minimumScore === 0 ? 'Todas' : `${minimumScore.toFixed(1)}+`}
          </output>
        </div>
        <div className="relative px-1 pt-2">
          <input
            id="minimum-score"
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={minimumScore}
            onChange={(event) => onMinimumScoreChange(Number(event.target.value))}
            className="relative z-10 h-1.5 w-full cursor-pointer accent-white"
          />
          <div className="mt-1.5 flex justify-between text-[9px] text-neutral-500">
            {Array.from({ length: 11 }, (_, index) => {
              const score = index / 2;
              return (
                <span
                  key={score}
                  className={minimumScore === score ? 'font-semibold text-white' : ''}
                >
                  {score % 1 === 0 ? score : score.toFixed(1)}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <FilterSelect
        label="Modo de jogo"
        value={selectedMode}
        options={modes}
        onChange={onModeChange}
      />
    </div>
  );
}
