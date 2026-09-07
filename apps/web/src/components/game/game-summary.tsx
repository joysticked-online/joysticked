'use client';

import { Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Game } from '@/lib/games';
import { GameTimeToBeat } from './game-time-to-beat';

interface GameGalleryTabProps {
  game: Game;
  onSelectBanner?: (imageUrl: string) => void;
  activeBannerUrl?: string | null;
}

export function GameGalleryTab({ game, onSelectBanner, activeBannerUrl }: GameGalleryTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mediaGallery = [...(game.artworks || []), ...(game.screenshots || [])];

  const handleSetBanner = (imageUrl: string) => {
    onSelectBanner?.(imageUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`admin_banner_${game.slug}`, imageUrl);
    }
    toast.success('Imagem definida como o banner principal do jogo!', {
      icon: '🖼️'
    });
  };

  if (mediaGallery.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-10 text-center">
        <ImageIcon className="mx-auto mb-2 size-8 text-neutral-600" />
        <p className="font-medium text-neutral-300 text-sm">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of gallery pictures */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {mediaGallery.map((imgUrl, index) => {
          const isCurrentBanner = activeBannerUrl === imgUrl;
          return (
            <div
              key={imgUrl}
              className="group relative aspect-video w-full overflow-hidden rounded-xl border border-white/[0.08] bg-neutral-900 transition-all duration-200 hover:border-white/30"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(imgUrl)}
                className="h-full w-full cursor-pointer focus:outline-hidden"
              >
                <img
                  src={imgUrl}
                  alt={`${game.name} captura ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </button>

              {/* Banner Badge if active */}
              {isCurrentBanner && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-bold text-[10px] text-black shadow-md">
                  <Check className="size-3" />
                  <span>Banner Ativo</span>
                </div>
              )}

              {/* Quick Admin Set Banner Button on Hover */}
              <div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetBanner(imgUrl);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/20 bg-black/80 px-2.5 py-1 font-medium text-[11px] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                >
                  <Sparkles className="size-3" />
                  <span>Usar como Banner</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Preview Modal with Admin "Definir como Banner" Button */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-5xl space-y-3 overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 p-3 shadow-2xl sm:p-4"
            >
              <img
                src={selectedImage}
                alt="Screenshot full preview"
                className="mx-auto max-h-[75vh] w-auto rounded-xl object-contain"
              />

              {/* Lightbox Footer Toolbar */}
              <div className="flex items-center justify-between gap-3 border-white/10 border-t pt-2">
                <span className="text-neutral-400 text-xs">
                  {game.name} • Imagem em Alta Resolução (1080p)
                </span>

                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSetBanner(selectedImage)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 font-semibold text-black text-xs shadow-sm transition-colors hover:bg-neutral-200"
                  >
                    <Sparkles className="size-3.5 text-black" />
                    <span>Definir como Banner do Jogo</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="cursor-pointer rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-neutral-300 text-xs transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Fechar ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GameDetailsTabProps {
  game: Game;
}

export function GameDetailsTab({ game }: GameDetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* 1. Time to Beat Component */}
      <GameTimeToBeat game={game} />

      {/* 4. Storyline */}
      {game.storyline && (
        <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
          <h3 className="font-semibold text-neutral-400 text-xs uppercase tracking-wider">
            Enredo & História
          </h3>
          <p className="whitespace-pre-line text-neutral-300 text-xs leading-relaxed sm:text-sm">
            {game.storyline}
          </p>
        </div>
      )}

      {/* 5. Meta Specs Grid */}
      <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6">
        <h3 className="font-semibold text-neutral-400 text-xs uppercase tracking-wider">
          Ficha Técnica
        </h3>

        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
          {game.firstReleaseDate && (
            <div className="flex items-center justify-between border-white/[0.04] border-b pb-2">
              <span className="text-neutral-500">Data de Lançamento</span>
              <span className="font-medium text-neutral-200">
                {new Date(game.firstReleaseDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}

          {game.developer && (
            <div className="flex items-center justify-between border-white/[0.04] border-b pb-2">
              <span className="text-neutral-500">Desenvolvedor</span>
              <span className="font-medium text-neutral-200">{game.developer}</span>
            </div>
          )}

          {game.publisher && (
            <div className="flex items-center justify-between border-white/[0.04] border-b pb-2">
              <span className="text-neutral-500">Publicadora</span>
              <span className="font-medium text-neutral-200">{game.publisher}</span>
            </div>
          )}

          {game.genres && game.genres.length > 0 && (
            <div className="flex items-center justify-between border-white/[0.04] border-b pb-2">
              <span className="text-neutral-500">Gêneros</span>
              <span className="font-medium text-neutral-200">{game.genres.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
