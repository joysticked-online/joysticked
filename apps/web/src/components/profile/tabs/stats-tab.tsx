'use client';

import { BarChart2, PieChart, Star, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { Profile, ProfileGame } from '../types';

const MOST_PLAYED_GAMES_DEFAULT = [
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    hours: '142 horas'
  },
  {
    id: 'baldurs-gate-3',
    name: "Baldur's Gate 3",
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    hours: '86 horas'
  },
  {
    id: 'cyberpunk-2077',
    name: 'Cyberpunk 2077',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8v0m.webp',
    hours: '64 horas'
  }
];

const TOP_RATED_GAMES_LIST = [
  { title: 'Elden Ring', year: '2022', rating: 5 },
  { title: "Baldur's Gate 3", year: '2023', rating: 5 },
  { title: 'The Last of Us Part I', year: '2022', rating: 5 },
  { title: 'Red Dead Redemption 2', year: '2018', rating: 5 },
  { title: 'Cyberpunk 2077: Phantom Liberty', year: '2023', rating: 5 },
  { title: 'The Witcher 3: Wild Hunt', year: '2015', rating: 5 },
  { title: 'Hollow Knight', year: '2017', rating: 5 }
];

type StatsTabProps = {
  genres: string[];
  displayGames?: ProfileGame[];
  profile?: Profile;
  isOwnProfile?: boolean;
};

export function StatsTab({
  genres,
  displayGames = [],
  profile,
  isOwnProfile = true
}: StatsTabProps) {
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Status counts (Quero Jogar, Jogado, Jogando, Pausado/Abandonado)
  const [collectionStatusCounts, setCollectionStatusCounts] = useState({
    played: 333,
    wantToPlay: 154,
    abandoned: 47,
    playing: 2
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let played = 0;
      let playing = 0;
      let want = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith('game_status_')) {
          const val = localStorage.getItem(key);
          if (val === 'Jogado') played++;
          else if (val === 'Jogando') playing++;
          else if (val === 'Quero Jogar') want++;
        }
      }

      if (played > 0 || playing > 0 || want > 0) {
        setCollectionStatusCounts({
          played: Math.max(played, 333),
          wantToPlay: Math.max(want, 154),
          abandoned: 47,
          playing: Math.max(playing, 2)
        });
      }
    } catch {}
  }, []);

  // Genre distribution
  const allGenresList = [
    { name: 'Aventura', percentage: 42.64, count: 142 },
    { name: 'Ação', percentage: 34.53, count: 115 },
    { name: 'Ficção científica', percentage: 31.23, count: 104 },
    { name: 'RPG & Estratégia', percentage: 22.82, count: 76 },
    { name: 'Tiro / FPS', percentage: 16.51, count: 55 },
    { name: 'Souls-like / Difícil', percentage: 14.11, count: 47 },
    { name: 'Indie & Roguelike', percentage: 11.71, count: 39 }
  ];

  const displayGenresList = showAllGenres ? allGenresList : allGenresList.slice(0, 3);
  const reviewsToShow = showAllReviews ? TOP_RATED_GAMES_LIST : TOP_RATED_GAMES_LIST.slice(0, 7);

  const totalStatus =
    collectionStatusCounts.played +
    collectionStatusCounts.wantToPlay +
    collectionStatusCounts.abandoned +
    collectionStatusCounts.playing;

  const pctPlayed = ((collectionStatusCounts.played / totalStatus) * 100).toFixed(2);
  const pctWant = ((collectionStatusCounts.wantToPlay / totalStatus) * 100).toFixed(2);
  const pctAbandoned = ((collectionStatusCounts.abandoned / totalStatus) * 100).toFixed(2);
  const pctPlaying = ((collectionStatusCounts.playing / totalStatus) * 100).toFixed(2);

  // SVG Donut calculation for "Status dos títulos"
  // Radius = 54, Circumference = 2 * PI * 54 = 339.29
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 14;

  const playedLen = (collectionStatusCounts.played / totalStatus) * circumference;
  const wantLen = (collectionStatusCounts.wantToPlay / totalStatus) * circumference;
  const abandonedLen = (collectionStatusCounts.abandoned / totalStatus) * circumference;
  const playingLen = (collectionStatusCounts.playing / totalStatus) * circumference;

  const playedOffset = 0;
  const wantOffset = -playedLen;
  const abandonedOffset = -(playedLen + wantLen);
  const playingOffset = -(playedLen + wantLen + abandonedLen);

  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.15 }}
      className="space-y-6"
    >
      {/* ── TOP BAR: METRICS SUMMARY (TEMPO TOTAL, AVALIAÇÕES & CONQUISTAS) ── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {/* Total Time */}
        <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/60 p-5">
          <span className="block font-bold font-redaction text-white text-xl tracking-tight sm:text-2xl">
            65 dias e 12.0 horas
          </span>
          <span className="mt-0.5 block text-neutral-400 text-xs">Tempo total jogado</span>
        </div>

        {/* Total Reviews */}
        <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/60 p-5">
          <span className="block font-bold font-redaction text-white text-xl tracking-tight sm:text-2xl">
            48 avaliações
          </span>
          <span className="mt-0.5 block text-neutral-400 text-xs">avaliações feitas</span>
        </div>

        {/* Total Achievements */}
        <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/60 p-5">
          <span className="block font-bold font-redaction text-white text-xl tracking-tight sm:text-2xl">
            348 conquistas
          </span>
          <span className="mt-0.5 block text-neutral-400 text-xs">conquistas desbloqueadas</span>
        </div>
      </div>

      {/* ── 2-COLUMN MODULAR STATS DASHBOARD (FOCUSED 4 CARDS) ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ── CARD 1: JOGOS MAIS JOGADOS (3 POSTERS WITH HOURS) ── */}
        <div className="flex flex-col justify-between space-y-4 rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-redaction text-base text-white tracking-tight sm:text-lg">
              Jogos mais jogados
            </h3>
            <Trophy className="size-4 text-neutral-400" />
          </div>

          {/* 3 Posters Row */}
          <div className="grid grid-cols-3 gap-3">
            {MOST_PLAYED_GAMES_DEFAULT.map((game) => (
              <div key={game.id} className="space-y-2">
                <Link
                  href={`/games/${game.id}`}
                  className="group relative block aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-md transition-all hover:border-white/30"
                >
                  <img
                    src={game.coverUrl}
                    alt={game.name}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <span className="block text-center font-medium text-[11px] text-neutral-400">
                  {game.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CARD 2: GÊNEROS MAIS JOGADOS (PROGRESS BARS WITH % [COUNT]) ── */}
        <div className="flex flex-col justify-between space-y-4 rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-redaction text-base text-white tracking-tight sm:text-lg">
              Gêneros mais jogados
            </h3>
            <BarChart2 className="size-4 text-neutral-400" />
          </div>

          <div className="flex-1 space-y-4">
            {displayGenresList.map((g) => (
              <div key={g.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{g.name}</span>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {g.percentage.toFixed(2)}% [{g.count}]
                  </span>
                </div>
                {/* Clean white progress bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${g.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setShowAllGenres(!showAllGenres)}
              className="cursor-pointer text-neutral-400 text-xs transition-colors hover:text-white"
            >
              {showAllGenres ? 'Ver menos' : 'Ver todos'}
            </button>
          </div>
        </div>

        {/* ── CARD 3: MELHORES AVALIAÇÕES (STAR LIST) ── */}
        <div className="flex flex-col justify-between space-y-4 rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-redaction text-base text-white tracking-tight sm:text-lg">
                Melhores avaliações
              </h3>
              <Star className="size-4 text-neutral-400" />
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Suas obras mais bem avaliadas recentemente
            </p>
          </div>

          <div className="flex-1 space-y-3.5">
            {reviewsToShow.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="block truncate font-medium text-white">{item.title}</span>
                  <span className="block text-[10.5px] text-neutral-500">{item.year}</span>
                </div>

                {/* 5 Solid Yellow Stars */}
                <div className="flex shrink-0 items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="size-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="cursor-pointer text-neutral-400 text-xs transition-colors hover:text-white"
            >
              {showAllReviews ? 'Ver menos' : 'Ver mais'}
            </button>
          </div>
        </div>

        {/* ── CARD 4: STATUS DOS TÍTULOS (CLEAN CENTERED DONUT + PROGRESS BARS) ── */}
        <div className="flex flex-col justify-between space-y-5 rounded-3xl border border-white/[0.06] bg-neutral-900/50 p-5 sm:p-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-redaction text-base text-white tracking-tight sm:text-lg">
                Status dos títulos
              </h3>
              <PieChart className="size-4 text-neutral-400" />
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">Assistidos, assistindo e a assistir</p>
          </div>

          {/* Centered Modern Donut Ring with Total Hub */}
          <div className="flex items-center justify-center py-2">
            <div className="relative flex items-center justify-center">
              <svg className="-rotate-90 size-40 transform" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  className="text-neutral-800"
                />
                {/* 1. Assistido Arc (White - 62.13%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#ffffff"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${playedLen} ${circumference - playedLen}`}
                  strokeDashoffset={playedOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  className="transition-all duration-700"
                />
                {/* 2. Assistir Arc (Slate - 28.73%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#64748b"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${wantLen} ${circumference - wantLen}`}
                  strokeDashoffset={wantOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  className="transition-all duration-700"
                />
                {/* 3. Abandonado Arc (Dark Slate - 8.77%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#334155"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${abandonedLen} ${circumference - abandonedLen}`}
                  strokeDashoffset={abandonedOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  className="transition-all duration-700"
                />
                {/* 4. Assistindo Arc (Amber Accent - 0.37%) */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="#f59e0b"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${playingLen} ${circumference - playingLen}`}
                  strokeDashoffset={playingOffset}
                  strokeLinecap="butt"
                  fill="transparent"
                  className="transition-all duration-700"
                />
              </svg>

              {/* Total Count in the center of the Donut */}
              <div className="pointer-events-none absolute flex select-none flex-col items-center justify-center text-center">
                <span className="font-bold font-redaction text-2xl text-white leading-none tracking-tight sm:text-3xl">
                  {totalStatus}
                </span>
                <span className="mt-1 font-medium text-[11px] text-neutral-400 uppercase tracking-wider">
                  Títulos
                </span>
              </div>
            </div>
          </div>

          {/* Clean Breakdown progress bars matching reference */}
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Assistir</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {pctWant}% [{collectionStatusCounts.wantToPlay}]
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full rounded-full bg-white" style={{ width: `${pctWant}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Assistido</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {pctPlayed}% [{collectionStatusCounts.played}]
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full rounded-full bg-white" style={{ width: `${pctPlayed}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Assistindo</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {pctPlaying}% [{collectionStatusCounts.playing}]
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div className="h-full rounded-full bg-white" style={{ width: `${pctPlaying}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Abandonado</span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {pctAbandoned}% [{collectionStatusCounts.abandoned}]
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${pctAbandoned}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
