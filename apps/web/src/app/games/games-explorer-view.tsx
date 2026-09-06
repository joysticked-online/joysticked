'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Star, Gamepad2, Loader2, TrendingUp } from 'lucide-react';
import { TopNav } from '@/components/navigation/top-nav';
import { searchGames, type Game } from '@/lib/games';

interface GamesExplorerViewProps {
  initialPopularGames: Game[];
}

const QUICK_TAGS = [
  'Elden Ring',
  'The Witcher',
  'God of War',
  'Cyberpunk 2077',
  'Zelda',
  'Final Fantasy',
  'Persona',
  'Resident Evil',
  'Dark Souls',
  'Red Dead Redemption'
];

export function GamesExplorerView({ initialPopularGames }: GamesExplorerViewProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      searchGames(query)
        .then((games) => {
          setSearchResults(games);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const displayGames = query.trim() ? searchResults : initialPopularGames;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-white/20">
      <TopNav />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-28 pb-24 space-y-10">
        {/* Hero Search Section (Monochrome B&W) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] via-neutral-900/60 to-neutral-950 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-2xl">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur-md">
              <Sparkles className="size-3.5 text-neutral-300" />
              <span>Conexão em Tempo Real com IGDB</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Encontre o seu próximo jogo
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400">
              Busque milhões de títulos, descubra notas da crítica, veja onde jogar e leia avaliações da comunidade.
            </p>

            {/* Search Input Bar */}
            <div className="relative mx-auto mt-6 max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 size-4.5 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar jogos (ex: Elden Ring, Baldur's Gate, Persona 5)..."
                  className="h-12 sm:h-14 w-full rounded-2xl border border-white/15 bg-black/70 pl-11 pr-12 text-sm text-white placeholder:text-neutral-500 backdrop-blur-xl transition-all focus:border-white focus:bg-black/90 focus:outline-hidden shadow-xl"
                />
                {isSearching && (
                  <div className="absolute right-4">
                    <Loader2 className="size-4.5 animate-spin text-neutral-300" />
                  </div>
                )}
                {query && !isSearching && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-4 text-xs font-semibold text-neutral-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick search chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs text-neutral-500">Populares:</span>
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300 transition-all hover:border-white/30 hover:bg-white/[0.08] hover:text-white active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results / Popular Grid Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              {query.trim() ? (
                <>
                  <Search className="size-4.5 text-neutral-300" />
                  <span>Resultados para &quot;{query}&quot;</span>
                  <span className="text-xs font-normal text-neutral-400">
                    ({searchResults.length} encontrados)
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp className="size-4.5 text-neutral-300" />
                  <span>Em Destaque & Populares</span>
                </>
              )}
            </h2>
          </div>

          {/* Games Grid */}
          {displayGames.length === 0 && !isSearching ? (
            <div className="rounded-3xl border border-white/8 bg-white/[0.01] p-12 text-center backdrop-blur-xl">
              <Gamepad2 className="size-12 mx-auto text-neutral-600 mb-3" />
              <h3 className="text-base font-semibold text-neutral-200">Nenhum jogo encontrado</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Tente buscar por outro termo ou nome em inglês.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {displayGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  className="group flex flex-col space-y-2.5 transition-transform duration-200 hover:-translate-y-1.5 focus:outline-hidden"
                >
                  {/* Poster Art */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/8 bg-neutral-900 shadow-md transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
                    {game.coverUrl ? (
                      <img
                        src={game.coverUrl}
                        alt={game.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-neutral-600">
                        <Gamepad2 className="size-8" />
                      </div>
                    )}

                    {/* Rating badge */}
                    {(game.rating || game.aggregatedRating) && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur-md border border-white/10">
                        <Star className="size-2.5 fill-amber-300 text-amber-300" />
                        <span>{(game.rating || game.aggregatedRating)?.toFixed(1)}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">
                      {game.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>{game.releaseYear || '—'}</span>
                      {game.genres?.[0] && (
                        <>
                          <span>•</span>
                          <span className="truncate">{game.genres[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
