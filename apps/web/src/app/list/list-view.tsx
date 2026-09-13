'use client';

import {
  ArrowLeft,
  Calendar,
  Check,
  Gamepad2,
  Heart,
  ListPlus,
  Plus,
  Share2,
  Sparkles,
  Star,
  Trash2,
  User as UserIcon,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AddGameToListModal } from '@/components/lists/add-game-to-list-modal';
import { CreateListModal } from '@/components/lists/create-list-modal';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { PosterImage } from '@/components/ui/poster-image';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/games';
import {
  DEFAULT_COMMUNITY_LISTS,
  type UserList,
  addGameToUserList,
  deleteUserList,
  getAllLists,
  getListByUserAndSlug,
  isListLiked,
  removeGameFromUserList,
  toggleLikeList
} from '@/lib/lists';

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
  const [otherLists, setOtherLists] = useState<UserList[]>(() => DEFAULT_COMMUNITY_LISTS.slice(0, 4));
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Client-side synchronization on mount
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
      setTimeout(() => setCopied(false), 2200);
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
      <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
        <TopNav />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pt-32 pb-24 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-neutral-500 shadow-2xl">
            <Gamepad2 className="size-8 text-neutral-400" />
          </div>
          <h1 className="mt-5 font-sans text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Lista não encontrada
          </h1>
          <p className="mt-2 max-w-md text-xs text-neutral-400 sm:text-sm">
            Não conseguimos encontrar a lista solicitada para o usuário informado. Ela pode ter sido removida ou o link está incorreto.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/lists"
              className="inline-flex h-9.5 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-neutral-200 active:scale-95"
            >
              <ArrowLeft className="size-3.5" />
              <span>Ver todas as listas</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-9.5 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white transition-all hover:bg-white/[0.08]"
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
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
      <TopNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-24 sm:px-6 sm:pt-28 md:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/lists"
            className="group inline-flex items-center gap-1.5 text-xs text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Voltar para Listas</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white active:scale-95"
            >
              <ListPlus className="size-3.5" />
              <span className="hidden sm:inline">Criar Lista</span>
            </button>
          </div>
        </div>

        {/* List Hero Banner */}
        {list && (
          <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d10] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] sm:p-8">
            {/* Background Ambient Glow & Cover Collage */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-15">
              <div className="flex size-full items-center justify-end -space-x-12 blur-sm scale-110">
                {list.games.slice(0, 4).map((g, idx) => (
                  <div
                    key={`${g.id || g.slug}-${idx}`}
                    className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl opacity-60"
                  >
                    {g.coverUrl && (
                      <Image
                        src={g.coverUrl}
                        alt={g.name}
                        fill
                        unoptimized
                        sizes="190px"
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d10] via-[#0d0d10]/90 to-transparent" />
            </div>

            {/* List Details Content */}
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3.5 max-w-2xl">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
                    <Sparkles className="size-3 text-amber-400" />
                    <span>Coleção</span>
                  </span>
                  {list.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 py-0.5 text-[10.5px] text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title & Description */}
                <div>
                  <h1 className="font-sans text-2xl font-bold text-white tracking-tight sm:text-3xl md:text-4xl">
                    {list.name}
                  </h1>
                  {list.description && (
                    <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed [text-wrap:pretty]">
                      {list.description}
                    </p>
                  )}
                </div>

                {/* Creator info */}
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={`/${list.ownerUsername}`}
                    className="group flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] py-1 pl-1 pr-3 text-xs text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                  >
                    <div className="relative size-6 shrink-0 overflow-hidden rounded-full bg-neutral-800 border border-white/10">
                      {list.ownerAvatarUrl ? (
                        <Image
                          src={list.ownerAvatarUrl}
                          alt={list.ownerUsername}
                          fill
                          unoptimized
                          sizes="24px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-[10px] font-bold text-white uppercase">
                          {list.ownerUsername[0]}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-white group-hover:underline">
                      {list.ownerDisplayName || list.ownerUsername}
                    </span>
                    <span className="text-neutral-500">@{list.ownerUsername}</span>
                  </Link>

                  <span className="text-xs text-neutral-500">•</span>
                  <span className="text-xs text-neutral-400 tabular-nums">
                    {list.games.length} {list.games.length === 1 ? 'jogo' : 'jogos'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={handleLikeToggle}
                  className={`inline-flex h-9.5 select-none items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-all active:scale-95 ${
                    liked
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_16px_rgba(244,63,94,0.15)]'
                      : 'border-white/[0.08] bg-white/[0.04] text-neutral-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <Heart
                    className={`size-4 transition-transform ${
                      liked ? 'fill-rose-400 text-rose-400 scale-110' : ''
                    }`}
                  />
                  <span>{likesCount}</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 text-xs font-semibold text-neutral-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="size-3.5" />
                      <span>Compartilhar</span>
                    </>
                  )}
                </button>

                {/* Add Game Button (Owner only or local creation) */}
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsAddGameOpen(true)}
                      className="inline-flex h-9.5 items-center gap-1.5 rounded-xl bg-white px-3.5 text-xs font-semibold text-black transition-all hover:bg-neutral-200 active:scale-95"
                    >
                      <Plus className="size-3.5" />
                      <span>Adicionar Jogo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteList}
                      title="Excluir Lista"
                      className="flex size-9.5 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 transition-colors hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Games Grid in List */}
        {list && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h2 className="font-sans text-sm font-bold text-white tracking-wide uppercase text-neutral-400">
                Títulos na Lista ({list.games.length})
              </h2>

              {isOwner && list.games.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddGameOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <Plus className="size-3.5" />
                  <span>Adicionar mais jogos</span>
                </button>
              )}
            </div>

            {list.games.length === 0 ? (
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
                <Gamepad2 className="mx-auto size-12 text-neutral-600" />
                <h3 className="mt-3 font-semibold text-white text-sm">Esta lista ainda está vazia</h3>
                <p className="mt-1 text-xs text-neutral-400 max-w-sm mx-auto">
                  {isOwner
                    ? 'Adicione títulos do catálogo do Joysticked para montar sua coleção personalizada.'
                    : 'O criador ainda não adicionou nenhum jogo a esta lista.'}
                </p>
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsAddGameOpen(true)}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-neutral-200 active:scale-95"
                  >
                    <Plus className="size-3.5" />
                    <span>Adicionar primeiro jogo</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {list.games.map((game, index) => (
                  <motion.div
                    key={`${game.id || game.slug}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: index * 0.02 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111114] shadow-md transition-all hover:border-white/20 hover:shadow-[0_12px_30px_rgba(0,0,0,0.8)]"
                  >
                    {/* Poster */}
                    <Link
                      href={`/games/${game.slug}`}
                      className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900"
                    >
                      <PosterImage src={game.coverUrl} alt={game.name} />

                      {/* Rank / Order Pill */}
                      <div className="absolute top-2 left-2 flex size-5 items-center justify-center rounded-md bg-black/80 font-mono text-[10px] font-bold text-white backdrop-blur-md border border-white/10">
                        {index + 1}
                      </div>

                      {/* Rating pill */}
                      {game.rating && (
                        <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-black/80 px-1.5 py-0.5 font-bold text-[9px] text-amber-300 backdrop-blur-md border border-white/10">
                          <Star className="size-2 fill-amber-300 text-amber-300" />
                          <span>{Number(game.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </Link>

                    {/* Game Info Bottom */}
                    <div className="flex flex-1 flex-col justify-between p-2.5">
                      <div>
                        <Link
                          href={`/games/${game.slug}`}
                          className="line-clamp-1 font-semibold text-xs text-white hover:underline"
                        >
                          {game.name}
                        </Link>
                        <p className="truncate text-[10px] text-neutral-400 mt-0.5">
                          {game.genres?.[0] || 'Game'} {game.releaseYear ? `• ${game.releaseYear}` : ''}
                        </p>
                      </div>

                      {/* Owner remove game action */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGame(game.slug || game.id)}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] py-1 px-2 text-[10px] text-neutral-400 transition-colors hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <X className="size-3" />
                          <span>Remover</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* More Lists from Community Exploration */}
        {otherLists.length > 0 && (
          <section className="mt-16 space-y-4 border-t border-white/[0.06] pt-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-sans text-base font-bold text-white tracking-tight">
                  Outras Listas da Comunidade
                </h2>
                <p className="text-xs text-neutral-400">Explore mais coleções criadas pelos jogadores.</p>
              </div>
              <Link
                href="/lists"
                className="text-xs font-semibold text-white hover:underline underline-offset-4"
              >
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {otherLists.map((other) => (
                <Link
                  key={other.id}
                  href={`/list?user=${other.ownerUsername}&listname=${other.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div>
                    {/* Collaged Mini Posters */}
                    <div className="-space-x-2.5 flex pb-3">
                      {other.games.slice(0, 4).map((g, i) => (
                        <div
                          key={`${g.id || g.slug}-${i}`}
                          className="relative size-10 overflow-hidden rounded-xl bg-neutral-800 ring-2 ring-[#08080a] shadow"
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

                    <h3 className="line-clamp-1 font-bold text-sm text-white group-hover:underline">
                      {other.name}
                    </h3>
                    {other.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
                        {other.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-2 text-[11px] text-neutral-500">
                    <span>@{other.ownerUsername}</span>
                    <span>{other.games.length} jogos</span>
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
        <AddGameToListModal
          isOpen={isAddGameOpen}
          onClose={() => setIsAddGameOpen(false)}
          existingGames={list.games}
          onAddGame={handleAddGame}
        />
      )}

      <Footer />
    </div>
  );
}
