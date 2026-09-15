'use client';

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Edit3,
  Gamepad2,
  Heart,
  Layers,
  LayoutGrid,
  List,
  ListPlus,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AddGameToListModal } from '@/components/lists/add-game-to-list-modal';
import { CreateListModal } from '@/components/lists/create-list-modal';
import { EditListModal } from '@/components/lists/edit-list-modal';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { PosterImage } from '@/components/ui/poster-image';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/games';
import {
  addGameToUserList,
  DEFAULT_COMMUNITY_LISTS,
  deleteUserList,
  getAllLists,
  getListByUserAndSlug,
  isListLiked,
  removeGameFromUserList,
  toggleLikeList,
  type UserList
} from '@/lib/lists';

type ViewMode = 'grid' | 'detailed' | 'compact';

export function ListView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  // Support query parameter variations: user, listname, lsitname, list, name, id
  const targetUser = searchParams.get('user') || searchParams.get('username') || '';
  const targetListSlug =
    searchParams.get('listname') ||
    searchParams.get('lsitname') ||
    searchParams.get('list') ||
    searchParams.get('name') ||
    searchParams.get('id') ||
    '';

  const [list, setList] = useState<UserList | null>(() => {
    if (!targetListSlug && !targetUser) return DEFAULT_COMMUNITY_LISTS[0] || null;
    return (
      DEFAULT_COMMUNITY_LISTS.find(
        (l) =>
          (!targetUser || l.ownerUsername.toLowerCase() === targetUser.toLowerCase()) &&
          (l.slug.toLowerCase() === targetListSlug.toLowerCase() || l.id === targetListSlug)
      ) || null
    );
  });

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [otherLists, setOtherLists] = useState<UserList[]>(() =>
    DEFAULT_COMMUNITY_LISTS.slice(0, 4)
  );
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mounted, setMounted] = useState(false);

  // Client-side synchronization on mount & parameter change
  useEffect(() => {
    setMounted(true);
    const all = getAllLists();

    if (!targetListSlug && !targetUser) {
      const first = all[0] || DEFAULT_COMMUNITY_LISTS[0];
      setList(first);
      if (first) {
        setLikesCount(first.likesCount);
        setLiked(isListLiked(first.id));
      }
      setOtherLists(all.filter((l) => l.id !== first?.id).slice(0, 4));
      return;
    }

    const found = getListByUserAndSlug(targetUser, targetListSlug);
    if (found) {
      setList(found);
      setLikesCount(found.likesCount);
      setLiked(isListLiked(found.id));
      setOtherLists(all.filter((l) => l.id !== found.id).slice(0, 4));
    } else {
      setList(null);
    }
  }, [targetUser, targetListSlug]);

  const isOwner = useMemo(() => {
    if (!currentUser || !list) return false;
    return (
      currentUser.username.toLowerCase() === list.ownerUsername.toLowerCase() ||
      list.ownerUsername === 'jogador'
    );
  }, [currentUser, list]);

  const isOfficial = useMemo(() => {
    return list?.ownerUsername.toLowerCase() === 'joysticked';
  }, [list]);

  // Derived statistics for the list
  const listStats = useMemo(() => {
    if (!list || list.games.length === 0) return { avgRating: 0, topGenres: [] };
    const ratings = list.games.map((g) => g.rating || 0).filter((r) => r > 0);
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length).toFixed(1)
        : '5.0';

    const genreCounts: Record<string, number> = {};
    for (const g of list.games) {
      for (const gen of g.genres || []) {
        genreCounts[gen] = (genreCounts[gen] || 0) + 1;
      }
    }
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    return { avgRating, topGenres };
  }, [list]);

  const handleLikeToggle = () => {
    if (!list) return;
    const res = toggleLikeList(list.id, likesCount);
    setLiked(res.isLiked);
    setLikesCount(res.likesCount);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleAddGame = (game: Game) => {
    if (!list) return;
    const updated = addGameToUserList(list.id, game);
    if (updated) {
      setList(updated);
    }
  };

  const handleRemoveGame = (gameSlugOrId: string | number) => {
    if (!list) return;
    const updated = removeGameFromUserList(list.id, gameSlugOrId);
    if (updated) {
      setList(updated);
    }
  };

  const handleDeleteList = () => {
    if (!list) return;
    if (confirm(`Tem certeza que deseja excluir a lista "${list.name}"?`)) {
      deleteUserList(list.id);
      router.push('/lists');
    }
  };

  if (mounted && !list && (targetUser || targetListSlug)) {
    return (
      <div className="flex min-h-screen flex-col bg-[#08080a] text-neutral-100 selection:bg-white/20 selection:text-white">
        <TopNav />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-neutral-500 shadow-2xl">
            <Gamepad2 className="size-8 text-neutral-400" />
          </div>
          <h1 className="mt-5 font-bold font-sans text-2xl text-white tracking-tight sm:text-3xl">
            Lista não encontrada
          </h1>
          <p className="mt-2 max-w-md text-neutral-400 text-xs sm:text-sm">
            Não conseguimos encontrar a lista solicitada. Ela pode ter sido removida ou o endereço
            está incorreto.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/lists"
              className="inline-flex h-9.5 items-center gap-2 rounded-xl bg-white px-4 font-semibold text-black text-xs transition-all hover:bg-neutral-200 active:scale-[0.96]"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ver todas as listas</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-9.5 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-semibold text-white text-xs transition-all hover:bg-white/[0.08] active:scale-[0.96]"
            >
              <Plus className="size-3.5" />
              <span>Criar nova lista</span>
            </button>
          </div>
        </main>
        <CreateListModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#08080a] text-neutral-100 selection:bg-white/20 selection:text-white">
      <TopNav />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-24 sm:px-6 sm:pt-28 md:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/lists"
            className="group inline-flex items-center gap-2 font-medium text-neutral-400 text-xs transition-colors hover:text-white"
          >
            <ArrowLeft className="group-hover:-translate-x-1 size-3.5 transition-transform duration-200" />
            <span>Voltar para Listas da Comunidade</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 font-medium text-neutral-300 text-xs backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-[0.96]"
            >
              <ListPlus className="size-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Criar Lista</span>
            </button>
          </div>
        </div>

        {/* List Hero Showcase */}
        {list && (
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d12] shadow-[0_24px_70px_rgba(0,0,0,0.85)]">
            {/* Ambient Multi-game Collage with Vignette */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
              <div className="-space-x-14 flex size-full scale-105 items-center justify-end blur-[2px]">
                {list.games.slice(0, 5).map((g, idx) => (
                  <div
                    key={`${g.id || g.slug}-${idx}`}
                    className="relative aspect-[2/3] w-56 shrink-0 rotate-1 overflow-hidden rounded-2xl opacity-70 shadow-2xl"
                  >
                    {g.coverUrl && (
                      <Image
                        src={g.coverUrl}
                        alt={g.name}
                        fill
                        unoptimized
                        sizes="230px"
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d12] via-[#0d0d12]/95 to-[#0d0d12]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent" />
            </div>

            {/* List Details Content */}
            <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl space-y-3.5">
                {/* Badges & Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {isOfficial ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-semibold text-[11px] text-amber-300 shadow-sm backdrop-blur-md">
                      <ShieldCheck className="size-3.5 text-amber-400" />
                      <span>Curadoria Oficial @joysticked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-medium text-[11px] text-neutral-300 backdrop-blur-md">
                      <Sparkles className="size-3 text-amber-400" />
                      <span>Coleção da Comunidade</span>
                    </span>
                  )}

                  {list.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-neutral-400 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title & Description */}
                <div>
                  <h1 className="font-bold font-sans text-2xl text-white tracking-tight [text-wrap:balance] sm:text-3xl lg:text-4xl">
                    {list.name}
                  </h1>
                  {list.description && (
                    <p className="mt-2 max-w-2xl text-neutral-300 text-xs leading-relaxed [text-wrap:pretty] sm:text-sm">
                      {list.description}
                    </p>
                  )}
                </div>

                {/* Meta Bar: Creator & Metrics */}
                <div className="flex flex-wrap items-center gap-3.5 pt-1 text-neutral-400 text-xs">
                  {/* Creator */}
                  <Link
                    href={`/${list.ownerUsername}`}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1 pr-3 pl-1 text-neutral-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    <div className="relative size-5 shrink-0 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-white/10">
                      {list.ownerAvatarUrl ? (
                        <Image
                          src={list.ownerAvatarUrl}
                          alt={list.ownerUsername}
                          fill
                          unoptimized
                          sizes="20px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center font-bold text-[9px] text-white uppercase">
                          {list.ownerUsername[0]}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-white group-hover:underline">
                      {list.ownerDisplayName || list.ownerUsername}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500">
                      @{list.ownerUsername}
                    </span>
                  </Link>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 font-mono text-neutral-300">
                      <Gamepad2 className="size-3.5 text-neutral-500" />
                      <strong className="font-semibold text-white">{list.games.length}</strong>
                      <span>{list.games.length === 1 ? 'título' : 'títulos'}</span>
                    </span>

                    {Number(listStats.avgRating) > 0 && (
                      <span className="inline-flex items-center gap-1 font-mono text-amber-300">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <strong>{listStats.avgRating}</strong>
                        <span className="text-neutral-500">média</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  className={`inline-flex h-9 select-none items-center gap-1.5 rounded-xl border px-3 font-semibold text-xs backdrop-blur-md transition-all active:scale-[0.96] ${
                    liked
                      ? 'border-rose-500/40 bg-rose-500/15 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : 'border-white/[0.1] bg-white/[0.04] text-neutral-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <Heart
                    className={`size-3.5 transition-transform duration-200 ${
                      liked ? 'scale-110 fill-rose-400 text-rose-400' : ''
                    }`}
                  />
                  <span className="font-mono">{likesCount}</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 font-semibold text-neutral-300 text-xs backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="font-medium text-emerald-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5 text-neutral-400" />
                      <span>Compartilhar</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 font-semibold text-neutral-300 text-xs backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
                >
                  <Edit3 className="size-3.5 text-amber-400" />
                  <span>Editar Lista</span>
                </button>

                {/* Add Game Button (Owner or Custom List) */}
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsAddGameOpen(true)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3.5 font-bold text-black text-xs shadow-md transition-all hover:bg-neutral-200 active:scale-[0.96]"
                    >
                      <Plus className="size-3.5 stroke-[2.5]" />
                      <span>Adicionar Jogo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteList}
                      title="Excluir Lista"
                      className="flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/15 hover:text-rose-300 active:scale-[0.96]"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section Header & View Controls */}
        {list && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 border-white/[0.08] border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold font-sans text-sm text-white tracking-tight sm:text-base">
                  Títulos na Lista
                </h2>
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-medium font-mono text-[11px] text-neutral-400">
                  {list.games.length}
                </span>
              </div>

              {/* View Switcher & Actions */}
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                {isOwner && list.games.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddGameOpen(true)}
                    className="inline-flex items-center gap-1.5 font-medium text-neutral-300 text-xs transition-colors hover:text-white"
                  >
                    <Plus className="size-3 text-amber-400" />
                    <span>Adicionar jogo</span>
                  </button>
                )}

                {/* View Mode Switcher */}
                <div className="flex items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-0.5 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    title="Grade de Pôsteres"
                    className={`flex size-6.5 items-center justify-center rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('detailed')}
                    title="Lista Detalhada"
                    className={`flex size-6.5 items-center justify-center rounded-lg transition-all ${
                      viewMode === 'detailed'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <List className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('compact')}
                    title="Modo Compacto"
                    className={`flex size-6.5 items-center justify-center rounded-lg transition-all ${
                      viewMode === 'compact'
                        ? 'bg-white text-black shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Layers className="size-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {list.games.length === 0 ? (
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c10] p-12 text-center shadow-xl">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-neutral-500">
                  <Gamepad2 className="size-6 text-neutral-400" />
                </div>
                <h3 className="mt-3 font-bold text-sm text-white">Esta lista ainda está vazia</h3>
                <p className="mx-auto mt-1 max-w-sm text-neutral-400 text-xs leading-relaxed">
                  Adicione títulos do catálogo do Joysticked para montar sua coleção personalizada.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddGameOpen(true)}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-bold text-black text-xs transition-all hover:bg-neutral-200 active:scale-[0.96]"
                >
                  <Plus className="size-3.5 stroke-[2.5]" />
                  <span>Adicionar primeiro jogo</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ─── 1. COMPACT POSTER GRID VIEW (LETTERBOXD STYLE) ─── */
              <div className="grid grid-cols-3 gap-2.5 gap-y-4 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
                {list.games.map((game, index) => (
                  <motion.div
                    key={`${game.id || game.slug}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    className="group relative flex flex-col"
                  >
                    {/* Game Poster with Depth Shadow */}
                    <div className="group-hover:-translate-y-1 relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#121216] shadow-[0_4px_16px_rgba(0,0,0,0.6)] transition-all duration-200 group-hover:border-white/25 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.85)]">
                      <Link href={`/games/${game.slug}`} className="relative block size-full">
                        <PosterImage src={game.coverUrl} alt={game.name} />

                        {/* Rank Badge - Compact Floating Glass */}
                        <div className="absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-md border border-white/15 bg-black/80 font-bold font-mono text-[9.5px] text-white/95 shadow-sm backdrop-blur-md">
                          {index + 1}
                        </div>

                        {/* Rating Badge */}
                        {game.rating && (
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-md border border-amber-500/20 bg-black/80 px-1.5 py-0.5 font-bold font-mono text-[9px] text-amber-300 shadow-sm backdrop-blur-md">
                            <Star className="size-2 fill-amber-400 text-amber-400" />
                            <span>{Number(game.rating).toFixed(1)}</span>
                          </div>
                        )}

                        {/* Hover Overlay with Quick Link */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <span className="inline-flex items-center gap-0.5 font-medium text-[10px] text-white/90">
                            <span>Ver Jogo</span>
                            <ChevronRight className="size-2.5 text-neutral-400" />
                          </span>
                        </div>
                      </Link>

                      {/* Owner remove game action */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGame(game.slug || game.id)}
                          title="Remover da lista"
                          className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-md border border-white/10 bg-black/80 text-neutral-400 opacity-0 backdrop-blur-md transition-all hover:bg-rose-500/20 hover:text-rose-300 group-hover:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Meta below card */}
                    <div className="mt-1.5 px-0.5">
                      <Link
                        href={`/games/${game.slug}`}
                        className="line-clamp-1 font-sans font-semibold text-[11.5px] text-white leading-tight transition-colors group-hover:text-amber-300"
                      >
                        {game.name}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-neutral-400">
                        <span className="truncate">{game.genres?.[0] || 'Jogo'}</span>
                        {game.releaseYear && (
                          <>
                            <span className="text-neutral-600">•</span>
                            <span className="font-mono text-neutral-500">{game.releaseYear}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : viewMode === 'detailed' ? (
              /* ─── 2. DETAILED RANKED LIST VIEW ─── */
              <div className="space-y-2.5">
                {list.games.map((game, index) => (
                  <motion.div
                    key={`${game.id || game.slug}-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    className="group relative flex items-center justify-between gap-3.5 rounded-2xl border border-white/[0.06] bg-[#0d0d12] p-3 transition-all hover:border-white/20 hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3.5">
                      {/* Rank Index */}
                      <span className="w-5 shrink-0 text-center font-bold font-mono text-neutral-500 text-xs group-hover:text-white">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* Poster Thumbnail */}
                      <Link
                        href={`/games/${game.slug}`}
                        className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900 shadow-md"
                      >
                        <PosterImage src={game.coverUrl} alt={game.name} />
                      </Link>

                      {/* Game Details */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/games/${game.slug}`}
                            className="truncate font-bold font-sans text-white text-xs transition-colors group-hover:text-amber-300 sm:text-sm"
                          >
                            {game.name}
                          </Link>
                          {game.releaseYear && (
                            <span className="font-mono text-[11px] text-neutral-500">
                              ({game.releaseYear})
                            </span>
                          )}
                        </div>

                        {/* Genre Badges */}
                        <div className="flex flex-wrap items-center gap-1">
                          {game.genres?.slice(0, 3).map((g) => (
                            <span
                              key={g}
                              className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[9.5px] text-neutral-400"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Meta & Actions */}
                    <div className="flex shrink-0 items-center gap-2.5">
                      {game.rating && (
                        <div className="flex items-center gap-1 rounded-lg border border-amber-500/20 bg-black/60 px-2 py-0.5 font-bold font-mono text-[11px] text-amber-300">
                          <Star className="size-2.5 fill-amber-400 text-amber-400" />
                          <span>{Number(game.rating).toFixed(1)}</span>
                        </div>
                      )}

                      <Link
                        href={`/games/${game.slug}`}
                        className="hidden items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-medium text-neutral-300 text-xs transition-colors hover:border-white/20 hover:text-white sm:inline-flex"
                      >
                        <span>Ver Jogo</span>
                        <ChevronRight className="size-3" />
                      </Link>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGame(game.slug || game.id)}
                          className="flex size-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-neutral-500 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* ─── 3. ULTRA COMPACT POSTER WALL VIEW ─── */
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {list.games.map((game, index) => (
                  <Link
                    key={`${game.id || game.slug}-${index}`}
                    href={`/games/${game.slug}`}
                    className="group relative aspect-[2/3] overflow-hidden rounded-lg border border-white/[0.08] bg-[#111115] shadow-md transition-all duration-200 hover:z-10 hover:scale-105 hover:border-white/30 hover:shadow-xl"
                  >
                    <PosterImage src={game.coverUrl} alt={game.name} />
                    <div className="absolute top-1 left-1 flex size-4 items-center justify-center rounded bg-black/80 font-bold font-mono text-[8px] text-white backdrop-blur-md">
                      {index + 1}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* More Lists from Community Exploration */}
        {otherLists.length > 0 && (
          <section className="mt-16 space-y-4 border-white/[0.08] border-t pt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold font-sans text-base text-white tracking-tight">
                  Outras Coleções da Comunidade
                </h2>
                <p className="mt-0.5 text-neutral-400 text-xs">
                  Explore mais listas criadas pelos jogadores do Joysticked.
                </p>
              </div>
              <Link
                href="/lists"
                className="inline-flex items-center gap-1 font-semibold text-white text-xs underline-offset-4 hover:underline"
              >
                <span>Ver todas as listas</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {otherLists.map((other) => (
                <Link
                  key={other.id}
                  href={`/list?user=${other.ownerUsername}&listname=${other.slug}`}
                  className="group hover:-translate-y-1 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0c0c10] p-4 transition-all duration-200 hover:border-white/20 hover:bg-[#111117] hover:shadow-[0_12px_30px_rgba(0,0,0,0.7)]"
                >
                  <div>
                    {/* Collaged Mini Posters with Overlap */}
                    <div className="-space-x-3 flex pt-0.5 pb-3">
                      {other.games.slice(0, 4).map((g, i) => (
                        <div
                          key={`${g.id || g.slug}-${i}`}
                          className="relative aspect-[2/3] w-10 overflow-hidden rounded-md bg-neutral-900 shadow-sm ring-2 ring-[#0c0c10] transition-transform group-hover:scale-105"
                          style={{ zIndex: 10 - i }}
                        >
                          {g.coverUrl && (
                            <Image
                              src={g.coverUrl}
                              alt={g.name}
                              fill
                              unoptimized
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <h3 className="line-clamp-1 font-bold text-white text-xs transition-colors group-hover:text-amber-300 sm:text-sm">
                      {other.name}
                    </h3>
                    {other.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] text-neutral-400 leading-relaxed">
                        {other.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-white/[0.06] border-t pt-2.5 text-[10.5px] text-neutral-400">
                    <span className="font-medium text-neutral-300">@{other.ownerUsername}</span>
                    <span className="font-mono text-neutral-500">{other.games.length} títulos</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <CreateListModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      {list && (
        <>
          <EditListModal
            isOpen={isEditOpen}
            list={list}
            onClose={() => setIsEditOpen(false)}
            onUpdate={(updated) => setList(updated)}
          />
          <AddGameToListModal
            isOpen={isAddGameOpen}
            onClose={() => setIsAddGameOpen(false)}
            existingGames={list.games}
            onAddGame={handleAddGame}
          />
        </>
      )}

      <Footer />
    </div>
  );
}
