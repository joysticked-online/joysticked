'use client';

import { Check, Loader2, Plus, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { type Game, searchGames } from '@/lib/games';

interface AddGameToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGames: Game[];
  onAddGame: (game: Game) => void;
}

export function AddGameToListModal({
  isOpen,
  onClose,
  existingGames,
  onAddGame
}: AddGameToListModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const games = await searchGames(query.trim(), controller.signal);
        setResults(games.slice(0, 8));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f12] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.95)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div>
                <h3 className="font-bold font-sans text-base text-white tracking-tight">
                  Adicionar Jogos à Lista
                </h3>
                <p className="text-neutral-400 text-xs">
                  Busque títulos no catálogo para incluir nesta coleção.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-xl text-neutral-400 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-neutral-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Digite o nome do jogo (ex: Elden Ring, Hollow Knight)..."
                className="h-10 w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] pr-9 pl-10 text-white text-xs outline-none transition-all placeholder:text-neutral-500 hover:border-white/15 focus:border-white/25 focus:bg-white/[0.06]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="-translate-y-1/2 absolute top-1/2 right-3 text-neutral-500 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Results List */}
            <div className="mt-4 max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2 py-12 text-neutral-400 text-xs">
                  <Loader2 className="size-4 animate-spin text-white" />
                  <span>Procurando jogos...</span>
                </div>
              ) : results.length > 0 ? (
                results.map((game) => {
                  const isAdded = existingGames.some(
                    (g) => (g.slug || g.id) === (game.slug || game.id)
                  );
                  return (
                    <div
                      key={game.id || game.slug}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative aspect-[2/3] w-9 shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-neutral-800">
                          {game.coverUrl && (
                            <Image
                              src={game.coverUrl}
                              alt={game.name}
                              fill
                              unoptimized
                              sizes="36px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white text-xs">{game.name}</p>
                          <p className="truncate text-[10.5px] text-neutral-400">
                            {game.genres?.[0] || 'Game'}{' '}
                            {game.releaseYear ? `• ${game.releaseYear}` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAdded}
                        onClick={() => onAddGame(game)}
                        className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 font-semibold text-xs transition-all ${
                          isAdded
                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                            : 'bg-white text-black hover:bg-neutral-200 active:scale-95'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="size-3.5" />
                            <span>Adicionado</span>
                          </>
                        ) : (
                          <>
                            <Plus className="size-3.5" />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : query.trim() ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  <p className="font-semibold text-neutral-300">Nenhum jogo encontrado</p>
                  <p className="mt-1 text-neutral-500">Tente buscar por outras palavras-chave.</p>
                </div>
              ) : (
                <div className="py-10 text-center text-neutral-500 text-xs">
                  Digite acima para buscar qualquer jogo no banco de dados.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
