'use client';

import { useState } from 'react';
import { Image as ImageIcon, Sparkles, Check, BookmarkCheck, ExternalLink, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import type { Game } from '@/lib/games';

interface GameGalleryTabProps {
  game: Game;
  onSelectBanner?: (imageUrl: string) => void;
  activeBannerUrl?: string | null;
}

export function GameGalleryTab({ game, onSelectBanner, activeBannerUrl }: GameGalleryTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mediaGallery = [
    ...(game.artworks || []),
    ...(game.screenshots || [])
  ];

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
        <ImageIcon className="size-8 mx-auto text-neutral-600 mb-2" />
        <p className="text-sm font-medium text-neutral-300">Nenhuma imagem disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Grid of gallery pictures */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-white text-black px-2 py-0.5 text-[10px] font-bold shadow-md">
                  <Check className="size-3" />
                  <span>Banner Ativo</span>
                </div>
              )}

              {/* Quick Admin Set Banner Button on Hover */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetBanner(imgUrl);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-black/80 hover:bg-white hover:text-black border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md transition-colors cursor-pointer"
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
              className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl space-y-3 p-3 sm:p-4"
            >
              <img
                src={selectedImage}
                alt="Screenshot full preview"
                className="max-h-[75vh] w-auto rounded-xl object-contain mx-auto"
              />

              {/* Lightbox Footer Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                <span className="text-xs text-neutral-400">
                  {game.name} • Imagem em Alta Resolução (1080p)
                </span>

                <div className="flex items-center gap-2">
                  {/* ADMIN BUTTON: SET AS BANNER */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSetBanner(selectedImage)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Sparkles className="size-3.5 text-black" />
                    <span>Definir como Banner do Jogo</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
      {/* Storyline */}
      {game.storyline && (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Enredo & História
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
            {game.storyline}
          </p>
        </div>
      )}

      {/* Meta Specs Grid */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Ficha Técnica
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {game.firstReleaseDate && (
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-neutral-500">Data de Lançamento</span>
              <span className="text-neutral-200 font-medium">
                {new Date(game.firstReleaseDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}

          {game.developer && (
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-neutral-500">Desenvolvedor</span>
              <span className="text-neutral-200 font-medium">{game.developer}</span>
            </div>
          )}

          {game.publisher && (
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-neutral-500">Publicadora</span>
              <span className="text-neutral-200 font-medium">{game.publisher}</span>
            </div>
          )}

          {game.genres && game.genres.length > 0 && (
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
              <span className="text-neutral-500">Gêneros</span>
              <span className="text-neutral-200 font-medium">{game.genres.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
