'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { PixelHeart, PixelHeartRatingPicker } from './pixel-heart';
import { PixelGamepad, PixelSword, PixelTrophy, PixelCartridge } from './game-pixel-icons';
import { GameReviewModal } from '../game/game-review-modal';
import type { Game } from '@/lib/games';

const DEMO_GAME: Game = {
  id: 9999,
  slug: 'elden-ring',
  name: 'Elden Ring',
  coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
  bannerUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/sc6udq.webp',
  releaseYear: '2022',
  developer: 'FromSoftware',
  publisher: 'Bandai Namco',
  genres: ['Action RPG', 'Open World', 'Souls-like'],
  platforms: ['PC', 'PlayStation 5', 'Xbox Series X', 'Steam Deck'],
};

export function GameBentoGrid() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  // Card 3 state: interactive heart review rating (0.5 to 5.0)
  const [heartRating, setHeartRating] = useState(4.5);
  const [selectedPlatform, setSelectedPlatform] = useState('Steam');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleTestReview = () => {
    if (!currentUser) {
      toast.info('Você precisa entrar ou criar uma conta para avaliar jogos.');
      router.push('/auth');
      return;
    }
    setIsDemoModalOpen(true);
  };

  // Dynamic verdict based on heart rating
  const getRatingVerdict = (score: number) => {
    if (score === 5) return { title: 'Obra-prima Absoluta', desc: 'Indispensável para qualquer biblioteca', tag: '10/10' };
    if (score >= 4.5) return { title: 'Excelente & Marcante', desc: 'Altamente recomendado pela comunidade', tag: '9.0+' };
    if (score >= 4) return { title: 'Muito Bom', desc: 'Vale cada hora investida', tag: '8.0+' };
    if (score >= 3.5) return { title: 'Bom com ressalvas', desc: 'Pontos altos superam os tropeços', tag: '7.0+' };
    if (score >= 3) return { title: 'Regular', desc: 'Apenas para entusiastas do gênero', tag: '6.0+' };
    return { title: 'Decepcionante', desc: 'Falta polimento ou ritmo', tag: '< 5.0' };
  };

  const verdict = getRatingVerdict(heartRating);

  // Card 4 state: quick review logs
  const [reviewIndex, setReviewIndex] = useState(0);
  const SAMPLE_REVIEWS = [
    {
      game: 'Elden Ring',
      hearts: 5.0,
      hours: '92h',
      status: 'Zerado',
      quote: 'A sensação de desbravar as Terras Intermédias é insuperável. Combate cirúrgico.',
      user: 'arthur_souza',
    },
    {
      game: 'Hollow Knight',
      hearts: 4.5,
      hours: '38h',
      status: '100% Platina',
      quote: 'Trilha sonora melancólica e chefes memoráveis. O ápice do estilo metroidvania.',
      user: 'pixel_beat',
    },
    {
      game: 'Chrono Trigger',
      hearts: 5.0,
      hours: '26h',
      status: 'Favorito',
      quote: 'Envelheceu como vinho fino. O sistema de batalhas conjuntas ainda dá aula.',
      user: 'retro_luis',
    },
  ];

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Section Header */}
      <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-[11px] font-medium tracking-wide text-neutral-300 backdrop-blur-md">
          <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          SISTEMA DE RESENHAS & CATÁLOGO
        </div>
        <h2 className="mt-4 font-redaction text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
          Feito por quem joga para quem ama resenhas.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400 sm:text-base">
          Chega de notas superficiais e números vazios. Avalie com corações pixelados de meio a cinco,
          organize seu backlog e leia opiniões que realmente ajudam você a decidir o próximo jogo.
        </p>
      </div>

      {/* Bento Grid: 5 Cards mimicking the reference layout with P&B styling + Red Heart accents */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

        {/* =========================================================================
            CARD 1: Review Breakdown / Vector Blueprint Inspector (Left Top) - md:col-span-4
           ========================================================================= */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0E0E0E] p-6 transition-[box-shadow,border-color] duration-150 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.8)] md:col-span-12 lg:col-span-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* Visual: Precision Vector Gamepad with Review Metrics */}
          <div className="relative flex h-64 w-full items-center justify-center sm:h-72">
            <svg
              className="h-full w-full max-w-[280px]"
              viewBox="0 0 240 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Reference Grid Crosses */}
              <path
                d="M120 10v220M10 120h220"
                stroke="white"
                strokeOpacity="0.08"
                strokeDasharray="3 3"
              />

              {/* Gamepad Outline */}
              <path
                d="M 50 145 C 38 120 42 70 85 68 C 110 67 115 88 120 88 C 125 88 130 67 155 68 C 198 70 202 120 190 145 C 182 162 165 170 148 152 C 135 138 128 138 120 138 C 112 138 105 138 92 152 C 75 170 58 162 50 145 Z"
                fill="rgba(255, 255, 255, 0.03)"
                stroke="#E5E5E5"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Review Metric Callouts along the curves */}
              <g transform="translate(20, 48)">
                <rect width="64" height="20" rx="4" fill="#141414" stroke="rgba(255,255,255,0.15)" />
                <text x="6" y="13" fill="#FFF" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  GAMEPLAY 9.8
                </text>
              </g>

              <g transform="translate(150, 48)">
                <rect width="68" height="20" rx="4" fill="#141414" stroke="rgba(255,255,255,0.15)" />
                <text x="6" y="13" fill="#FFF" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  NARRATIVA 10
                </text>
              </g>

              <g transform="translate(74, 185)">
                <rect width="92" height="20" rx="4" fill="#141414" stroke="rgba(255,255,255,0.15)" />
                <text x="6" y="13" fill="#FFF" fontSize="8.5" fontFamily="monospace" fontWeight="bold">
                  TRILHA SONORA 9.5
                </text>
              </g>

              {/* Bezier Tangent Handles */}
              <line x1="85" y1="68" x2="52" y2="58" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="155" y1="68" x2="188" y2="58" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />

              {/* Red Anchor Nodes */}
              {[
                { cx: 85, cy: 68 },
                { cx: 120, cy: 88 },
                { cx: 155, cy: 68 },
                { cx: 190, cy: 145 },
                { cx: 148, cy: 152 },
                { cx: 120, cy: 138 },
                { cx: 92, cy: 152 },
                { cx: 50, cy: 145 },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.cx} cy={pt.cy} r="4" fill="#0E0E0E" stroke="#FFF" strokeWidth="1.5" />
                  <circle cx={pt.cx} cy={pt.cy} r="1.5" fill="#EF4444" />
                </g>
              ))}

              {/* Center Heart Icon */}
              <circle cx="120" cy="113" r="8" fill="#181818" stroke="rgba(255,255,255,0.2)" />
              <path
                d="M117 111 C117 109 119 109 120 110 C121 109 123 109 123 111 C123 113 120 115 120 115 C120 115 117 113 117 111 Z"
                fill="#EF4444"
              />
            </svg>
          </div>

          {/* Copy Caption */}
          <div className="relative z-10 mt-4 border-t border-white/[0.06] pt-4">
            <h3 className="font-semibold text-white text-base tracking-tight">
              A anatomia de um review
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Desmembre a experiência: jogabilidade, direção de arte, história e trilha sonora. Análises fundamentadas por quem jogou de ponta a ponta.
            </p>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: Isometric Backlog Stack (Center Tall Card) - md:col-span-4
           ========================================================================= */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0E0E0E] p-6 transition-[box-shadow,border-color] duration-150 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.8)] md:col-span-12 lg:col-span-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Isometric 3-Layer Cartridge Backlog Stack */}
          <div className="relative flex h-64 w-full items-center justify-center sm:h-72">
            <svg
              className="h-full w-full max-w-[240px] drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              viewBox="0 0 240 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Projection Guidelines connecting corners */}
              <line x1="42" y1="52" x2="42" y2="240" stroke="white" strokeOpacity="0.12" strokeDasharray="3 3" />
              <line x1="198" y1="52" x2="198" y2="240" stroke="white" strokeOpacity="0.12" strokeDasharray="3 3" />
              <line x1="120" y1="22" x2="120" y2="210" stroke="white" strokeOpacity="0.15" strokeDasharray="3 3" />
              <line x1="120" y1="98" x2="120" y2="270" stroke="white" strokeOpacity="0.15" strokeDasharray="3 3" />

              {/* LAYER 3: Backlog & Na Fila (Chrono Trigger) - Rendered at base */}
              <g id="layer-3-backlog">
                {/* Side Left */}
                <path d="M42 224 L120 254 L120 270 L42 240 Z" fill="#101010" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" />
                {/* Side Right */}
                <path d="M120 254 L198 224 L198 240 L120 270 Z" fill="#141414" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" />
                {/* Top Face */}
                <path d="M120 194 L198 224 L120 254 L42 224 Z" fill="#171717" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
                {/* Content on Top Face */}
                <circle cx="68" cy="224" r="3" fill="#737373" />
                <text x="78" y="227" fill="#888888" fontSize="8" fontFamily="monospace">
                  NA FILA: CHRONO TRIGGER
                </text>
              </g>

              {/* LAYER 2: Zerado & Avaliado (Elden Ring - 5 Corações) - Rendered middle */}
              <g id="layer-2-reviewed">
                {/* Side Left */}
                <path d="M42 138 L120 168 L120 184 L42 154 Z" fill="#141414" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
                {/* Side Right */}
                <path d="M120 168 L198 138 L198 154 L120 184 Z" fill="#181818" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" />
                {/* Top Face */}
                <path d="M120 108 L198 138 L120 168 L42 138 Z" fill="#1B1B1B" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                {/* Red Heart on Cartridge */}
                <circle cx="68" cy="138" r="3.5" fill="#EF4444" />
                <text x="78" y="141" fill="#FFFFFF" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  AVALIADO: ELDEN RING (5.0)
                </text>
              </g>

              {/* LAYER 1: Jogando Agora (Hollow Knight - 28h) - Rendered on TOP */}
              <g id="layer-1-playing">
                {/* Side Left */}
                <path d="M42 52 L120 82 L120 98 L42 68 Z" fill="#161616" stroke="rgba(255,255,255,0.24)" strokeWidth="1.2" />
                {/* Side Right */}
                <path d="M120 82 L198 52 L198 68 L120 98 Z" fill="#1A1A1A" stroke="rgba(255,255,255,0.24)" strokeWidth="1.2" />
                {/* Top Face */}
                <path d="M120 22 L198 52 L120 82 L42 52 Z" fill="#202020" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
                {/* Status LED & Label */}
                <circle cx="68" cy="52" r="3.5" fill="#22C55E" />
                <text x="78" y="55" fill="#FFFFFF" fontSize="8" fontFamily="monospace" fontWeight="bold">
                  JOGANDO: HOLLOW KNIGHT
                </text>
              </g>
            </svg>
          </div>

          {/* Copy Caption */}
          <div className="relative z-10 mt-4 border-t border-white/[0.06] pt-4">
            <h3 className="font-semibold text-white text-base tracking-tight">
              Seu backlog em camadas
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              O que você está jogando agora, o que já zerou com resenha e o que está guardado para o final de semana. Tudo sincronizado sem esforço.
            </p>
          </div>
        </div>

        {/* =========================================================================
            CARD 3: Interactive Red Pixel Heart Review Rating (Right Top) - md:col-span-4
           ========================================================================= */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0E0E0E] p-6 transition-[box-shadow,border-color] duration-150 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.8)] md:col-span-12 lg:col-span-4">
          {/* Top Bar: Platform pills + hours counter */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
            <div className="flex items-center gap-1">
              {['Steam', 'PS5', 'Switch'].map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium transition-colors ${selectedPlatform === plat
                    ? 'bg-white text-black font-bold'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                    }`}
                >
                  {plat}
                </button>
              ))}
            </div>

            <span className="font-mono text-[10px] text-neutral-400">
              48h registradas
            </span>
          </div>

          {/* Center: Interactive Pixel Heart Rating Picker (User-Requested Feature!) */}
          <div className="relative flex flex-col items-center justify-center py-6">
            <span className="mb-3 font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              Avaliação do Jogador [Clique p/ meio ou cheio]
            </span>

            {/* The 5-heart rating bar with 0.5 granularity */}
            <div className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] shadow-[0_0_28px_rgba(239,68,68,0.12)]">
              <PixelHeartRatingPicker
                value={heartRating}
                onChange={(newScore) => setHeartRating(newScore)}
                size={34}
              />
            </div>

            {/* Score Pill & Dynamic Text */}
            <div className="mt-4 flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="font-mono text-2xl font-bold text-white tracking-tight">
                  {heartRating.toFixed(1)}
                </span>
                <span className="font-mono text-xs text-neutral-500">/ 5.0</span>
                <span className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-red-400 border border-red-500/30">
                  {verdict.tag}
                </span>
              </div>

              <p className="mt-1 font-semibold text-xs text-neutral-200">
                {verdict.title}
              </p>
              <p className="text-[11px] text-neutral-500">
                {verdict.desc}
              </p>

              {/* Button to test the 3DS / Game Boy Review Console */}
              <button
                type="button"
                onClick={handleTestReview}
                className="mt-3.5 inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] text-neutral-300 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-white group/btn"
              >
                <PixelHeart size={11} variant="full" color="#EF4444" />
                <span>Testar Pop-up 3DS</span>
                <span className="text-[10px] text-neutral-500 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:text-neutral-300">
                  →
                </span>
              </button>
            </div>
          </div>

          {/* Copy Caption */}
          <div className="relative z-10 mt-4 border-t border-white/[0.06] pt-4">
            <h3 className="font-semibold text-white text-base tracking-tight">
              Avaliação em Corações 8-Bit
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Adeus estrelas genéricas. Escolha entre corações cheios ou meio-coração para expressar com precisão o impacto de cada jogo.
            </p>
          </div>
        </div>

        {/* =========================================================================
            CARD 4: Tactile Review Log Capsule (Left Bottom) - md:col-span-5
           ========================================================================= */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0E0E0E] p-6 transition-[box-shadow,border-color] duration-150 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.8)] md:col-span-6 lg:col-span-5">
          {/* Interactive Floating Review Log in the center */}
          <div className="relative flex min-h-[160px] w-full items-center justify-center">
            <button
              type="button"
              onClick={() => setReviewIndex((prev) => (prev + 1) % SAMPLE_REVIEWS.length)}
              className="group/pill relative flex w-full max-w-sm cursor-pointer select-none flex-col gap-2 rounded-2xl border border-white/15 bg-neutral-900/90 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    {SAMPLE_REVIEWS[reviewIndex].game}
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-neutral-300">
                    {SAMPLE_REVIEWS[reviewIndex].status}
                  </span>
                </div>

                {/* Red Pixel Hearts corresponding to the review */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const isFull = SAMPLE_REVIEWS[reviewIndex].hearts >= i + 1;
                    const isHalf = !isFull && SAMPLE_REVIEWS[reviewIndex].hearts >= i + 0.5;
                    return (
                      <PixelHeart
                        key={i}
                        size={14}
                        variant={isFull ? 'full' : isHalf ? 'half' : 'empty'}
                        color="#EF4444"
                      />
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-neutral-300 italic line-clamp-2 leading-relaxed">
                &ldquo;{SAMPLE_REVIEWS[reviewIndex].quote}&rdquo;
              </p>

              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono pt-1 border-t border-white/[0.06]">
                <span>@{SAMPLE_REVIEWS[reviewIndex].user} &bull; {SAMPLE_REVIEWS[reviewIndex].hours}</span>
                <span className="text-neutral-400 group-hover/pill:text-white transition-colors">
                  [clique para alternar]
                </span>
              </div>
            </button>
          </div>

          {/* Copy Caption */}
          <div className="relative z-10 mt-4 border-t border-white/[0.06] pt-4">
            <h3 className="font-semibold text-white text-base tracking-tight">
              Diário de bordo sem atrito
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Registre uma frase rápida ao terminar uma fase ou escreva um ensaio completo. Seu feed, sua história de jogo.
            </p>
          </div>
        </div>

        {/* =========================================================================
            CARD 5: CAD Blueprint of a Game Review Card (Right Bottom) - md:col-span-7
           ========================================================================= */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0E0E0E] p-6 transition-[box-shadow,border-color] duration-150 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.8)] md:col-span-6 lg:col-span-7">
          {/* Technical CAD Blueprint Vector Graphic of Review Metrics */}
          <div className="relative flex min-h-[160px] w-full items-center justify-center py-2">
            <svg
              className="h-full w-full max-w-[340px]"
              viewBox="0 0 320 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Bounding Box */}
              <rect x="40" y="10" width="240" height="160" rx="14" stroke="white" strokeOpacity="0.1" strokeDasharray="3 3" />

              {/* Concentric Rating Circles */}
              <circle cx="160" cy="90" r="65" stroke="white" strokeOpacity="0.1" strokeWidth="1" />
              <circle cx="160" cy="90" r="45" stroke="white" strokeOpacity="0.15" strokeWidth="1.2" />
              <circle cx="160" cy="90" r="25" stroke="white" strokeOpacity="0.1" strokeDasharray="2 2" />

              {/* 45° Crosshair drafting lines */}
              <line x1="115" y1="45" x2="205" y2="135" stroke="white" strokeOpacity="0.08" />
              <line x1="205" y1="45" x2="115" y2="135" stroke="white" strokeOpacity="0.08" />

              {/* Horizontal Dimension Arrow (240px) */}
              <line x1="40" y1="165" x2="280" y2="165" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
              <path d="M40 162 L36 165 L40 168 M280 162 L284 165 L280 168" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
              <text x="145" y="162" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">
                240 px
              </text>

              {/* Verified Playtime Stamp */}
              <g transform="translate(52, 24)">
                <rect width="88" height="18" rx="3" fill="#141414" stroke="rgba(255,255,255,0.15)" />
                <text x="6" y="12" fill="#E5E5E5" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  ✓ HORAS VERIFICADAS
                </text>
              </g>

              {/* Center Game Review Shield with 4.5 Rating */}
              <g transform="translate(142, 72)">
                <rect width="36" height="36" rx="8" fill="#121212" stroke="#FFF" strokeWidth="1.5" />
                <text x="18" y="24" textAnchor="middle" fill="#EF4444" fontSize="16" fontFamily="monospace" fontWeight="bold">
                  ♥
                </text>
              </g>

              {/* Anti-Review Bombing Protection Callout */}
              <g transform="translate(182, 126)">
                <rect width="84" height="18" rx="3" fill="#141414" stroke="rgba(239,68,68,0.3)" />
                <text x="6" y="12" fill="#EF4444" fontSize="7.5" fontFamily="monospace">
                  ANTI-BOMBING: ON
                </text>
              </g>
            </svg>
          </div>

          {/* Copy Caption */}
          <div className="relative z-10 mt-4 border-t border-white/[0.06] pt-4">
            <h3 className="font-semibold text-white text-base tracking-tight">
              Métricas que protegem a verdade
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-400">
              Horas de jogo checadas, filtros contra review bombing e moderação comunitária. Você sabe que a nota reflete o jogo real.
            </p>
          </div>
        </div>

      </div>

      {/* 3DS Dual-Screen Review Pop-up Interactive Test Modal */}
      <GameReviewModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        game={DEMO_GAME}
      />
    </section>
  );
}
