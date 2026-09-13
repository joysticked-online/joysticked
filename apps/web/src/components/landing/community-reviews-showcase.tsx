'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { PixelHeart } from './pixel-heart';
import { MessageSquare, ThumbsUp, ArrowRight, Gamepad2 } from 'lucide-react';

interface FeaturedReview {
  id: string;
  gameTitle: string;
  gameSlug: string;
  coverUrl: string;
  hearts: number; // e.g. 5.0, 4.5, 4.0
  user: {
    username: string;
    displayName: string;
    avatarBg: string;
  };
  platform: string;
  hoursPlayed: string;
  status: 'Zerado' | '100% Platina' | 'Replay';
  category: 'all' | 'masterpiece' | 'indie' | 'rpg';
  excerpt: string;
  likes: number;
  comments: number;
}

const FEATURED_REVIEWS: FeaturedReview[] = [
  {
    id: '1',
    gameTitle: 'Elden Ring',
    gameSlug: 'elden-ring',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    hearts: 5.0,
    user: {
      username: 'gabriel_souza',
      displayName: 'Gabriel S.',
      avatarBg: 'bg-neutral-800',
    },
    platform: 'PC (Steam)',
    hoursPlayed: '94h',
    status: 'Zerado',
    category: 'masterpiece',
    excerpt:
      'A sensação de explorar as Terras Intermédias é algo que acontece uma vez a cada década. O jogo confia na curiosidade do jogador sem marcadores poluindo a tela.',
    likes: 342,
    comments: 28,
  },
  {
    id: '2',
    gameTitle: 'Hollow Knight',
    gameSlug: 'hollow-knight',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cobfzp.webp',
    hearts: 4.5,
    user: {
      username: 'clara_pixels',
      displayName: 'Clara V.',
      avatarBg: 'bg-neutral-800',
    },
    platform: 'Switch',
    hoursPlayed: '42h',
    status: '100% Platina',
    category: 'indie',
    excerpt:
      'Hallownest tem uma melancolia única. A precisão do pulo e o corte do ferrão tornam cada chefe um duelo de ritmo. Meio coração a menos apenas pelo backtracking no final.',
    likes: 215,
    comments: 19,
  },
  {
    id: '3',
    gameTitle: 'Chrono Trigger',
    gameSlug: 'chrono-trigger',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co87df.webp',
    hearts: 5.0,
    user: {
      username: 'retro_marcos',
      displayName: 'Marcos R.',
      avatarBg: 'bg-neutral-800',
    },
    platform: 'SNES / Steam',
    hoursPlayed: '28h',
    status: 'Replay',
    category: 'rpg',
    excerpt:
      'Envelheceu como poucos jogos na história. Zero gordura, ritmo impecável e uma das melhores trilhas sonoras já compostas na história dos videogames.',
    likes: 489,
    comments: 54,
  },
  {
    id: '4',
    gameTitle: 'Balatro',
    gameSlug: 'balatro',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co9f4g.webp',
    hearts: 4.5,
    user: {
      username: 'deck_builder',
      displayName: 'Lucas T.',
      avatarBg: 'bg-neutral-800',
    },
    platform: 'PC (Steam)',
    hoursPlayed: '68h',
    status: 'Zerado',
    category: 'indie',
    excerpt:
      'Uma hipnose em forma de pôquer com sinergias absurdas. O feedback sonoro de quando os coringas multiplicam a pontuação é dopamina pura.',
    likes: 178,
    comments: 14,
  },
];

export function CommunityReviewsShowcase() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'masterpiece' | 'indie' | 'rpg'>('all');

  const filteredReviews =
    selectedFilter === 'all'
      ? FEATURED_REVIEWS
      : FEATURED_REVIEWS.filter((r) => r.category === selectedFilter || (selectedFilter === 'masterpiece' && r.hearts === 5.0));

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between pb-6">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
            <span className="size-1.5 rounded-full bg-red-500" />
            Vozes da Comunidade
          </div>
          <h3 className="mt-2 font-redaction text-2xl tracking-tight text-white sm:text-3xl">
            Resenhas recentes de quem zerou.
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-neutral-400 sm:text-sm">
            Sem bots, sem notas compradas. Opiniões sinceras com tempo de jogo registrado e notas em corações.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1 text-xs">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'masterpiece', label: '5.0 Corações' },
            { id: 'indie', label: 'Indies' },
            { id: 'rpg', label: 'RPGs' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`rounded-lg px-3 py-1 font-medium transition-colors ${selectedFilter === tab.id
                ? 'bg-white text-black font-bold shadow-xs'
                : 'text-neutral-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Reviews */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#0E0E0E] p-6 transition-[box-shadow,border-color,background-color] duration-150 hover:border-white/20 hover:bg-[#121212] hover:shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
            >
              <div>
                {/* Header: Game Info + Red Pixel Hearts */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {/* Game Cover */}
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                      <img
                        src={review.coverUrl}
                        alt={review.gameTitle}
                        className="size-full object-cover transition-transform duration-150 group-hover:scale-105"
                      />
                    </div>

                    <div>
                      <Link
                        href={`/games/${review.gameSlug}`}
                        className="font-bold text-sm text-white hover:underline decoration-neutral-500"
                      >
                        {review.gameTitle}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-neutral-400">
                        <span>{review.platform}</span>
                        <span>&bull;</span>
                        <span className="text-neutral-300">{review.hoursPlayed}</span>
                        <span>&bull;</span>
                        <span className="rounded bg-white/[0.06] px-1 py-0.2 text-neutral-300">
                          {review.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Red Pixel Heart Rating (with Half-Heart support!) */}
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: 5 }, (_, i) => {
                      const isFull = review.hearts >= i + 1;
                      const isHalf = !isFull && review.hearts >= i + 0.5;
                      return (
                        <PixelHeart
                          key={i}
                          size={16}
                          variant={isFull ? 'full' : isHalf ? 'half' : 'empty'}
                          color="#EF4444"
                        />
                      );
                    })}
                    <span className="ml-1 font-mono text-xs font-bold text-neutral-200">
                      {review.hearts.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Review Excerpt */}
                <p className="mt-4 text-xs leading-relaxed text-neutral-300 sm:text-sm">
                  &ldquo;{review.excerpt}&rdquo;
                </p>
              </div>

              {/* Review Footer: User Info & Engagement */}
              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <div className={`flex size-6 items-center justify-center rounded-full ${review.user.avatarBg} text-[10px] font-bold text-white uppercase`}>
                    {review.user.username[0]}
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400">
                    @{review.user.username}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="flex items-center gap-1 hover:text-white transition-colors">
                    <ThumbsUp className="size-3" />
                    <span>{review.likes}</span>
                  </span>
                  <span className="flex items-center gap-1 hover:text-white transition-colors">
                    <MessageSquare className="size-3" />
                    <span>{review.comments}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Explore More Reviews CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <span>Ver mais resenhas no catálogo</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
