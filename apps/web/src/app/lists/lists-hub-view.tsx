'use client';

import {
  ArrowRight,
  Compass,
  Flame,
  Gamepad2,
  Heart,
  ListPlus,
  Plus,
  Search,
  ShieldCheck
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CreateListModal } from '@/components/lists/create-list-modal';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { useAuth } from '@/hooks/use-auth';
import { DEFAULT_COMMUNITY_LISTS, getAllLists, getUserLists, type UserList } from '@/lib/lists';

const CATEGORY_TAGS = [
  'Todas',
  'Favoritos',
  'Souls-like',
  'Indie',
  'Narrativa',
  'RPG',
  'Clássicos'
];

export function ListsHubView() {
  const { user: currentUser } = useAuth();
  const [selectedTag, setSelectedTag] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allLists, setAllLists] = useState<UserList[]>(DEFAULT_COMMUNITY_LISTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAllLists(getAllLists());
  }, []);

  const myLists = useMemo(() => {
    if (!currentUser || !mounted) return [];
    return getUserLists(currentUser.username);
  }, [currentUser, mounted]);

  const featuredList = useMemo(() => {
    return allLists.find((l) => l.slug === 'souls-likes-essenciais') || allLists[0] || null;
  }, [allLists]);

  const filteredLists = useMemo(() => {
    let list = allLists;

    if (selectedTag !== 'Todas') {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter(
        (l) =>
          l.tags?.some((t) => t.toLowerCase().includes(tagLower)) ||
          l.name.toLowerCase().includes(tagLower) ||
          l.description?.toLowerCase().includes(tagLower)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.ownerUsername.toLowerCase().includes(q) ||
          l.ownerDisplayName?.toLowerCase().includes(q) ||
          l.games.some((g) => g.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allLists, selectedTag, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-[#08080a] text-neutral-100 selection:bg-white/20 selection:text-white">
      <TopNav />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-24 sm:px-6 sm:pt-28 md:px-8">
        {/* Header Hero Section */}
        <div className="mb-10 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 font-semibold text-[11px] text-amber-300 backdrop-blur-md">
                  <Compass className="size-3.5 text-amber-400" />
                  <span>Explorador de Coleções</span>
                </span>
              </div>
              <h1 className="font-bold font-sans text-3xl text-white tracking-tight sm:text-4xl lg:text-5xl">
                Listas & Rankings
              </h1>
              <p className="max-w-2xl text-neutral-400 text-xs leading-relaxed [text-wrap:pretty] sm:text-sm">
                Descubra coleções temáticas, desafios icônicos e recomendações essenciais dos
                jogadores da comunidade.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-5 font-bold text-black text-xs shadow-lg shadow-white/10 transition-all hover:bg-neutral-200 active:scale-[0.96]"
            >
              <ListPlus className="size-4 stroke-[2.5]" />
              <span>Criar Nova Lista</span>
            </button>
          </div>

          {/* Featured Spotlight Card */}
          {featuredList && !searchQuery.trim() && selectedTag === 'Todas' && (
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0d12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] sm:p-8">
              {/* Background Glow */}
              <div className="-right-20 -top-20 pointer-events-none absolute size-96 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-[#0d0d12] via-[#0d0d12]/90 to-transparent" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-bold text-[10px] text-amber-300 uppercase tracking-wider">
                      <Flame className="size-3 text-amber-400" />
                      <span>Destaque da Semana</span>
                    </span>
                    <span className="text-neutral-500 text-xs">•</span>
                    <span className="font-mono text-neutral-400 text-xs">
                      {featuredList.games.length} jogos
                    </span>
                  </div>

                  <h2 className="font-bold font-sans text-2xl text-white tracking-tight sm:text-3xl">
                    {featuredList.name}
                  </h2>
                  <p className="text-neutral-300 text-xs leading-relaxed [text-wrap:pretty] sm:text-sm">
                    {featuredList.description}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <Link
                      href={`/list?user=${featuredList.ownerUsername}&listname=${featuredList.slug}`}
                      className="inline-flex h-9.5 items-center gap-2 rounded-xl bg-white px-4 font-bold text-black text-xs transition-all hover:bg-neutral-200 active:scale-[0.96]"
                    >
                      <span>Explorar Coleção</span>
                      <ArrowRight className="size-3.5" />
                    </Link>

                    <div className="flex items-center gap-2 font-medium text-neutral-400 text-xs">
                      <div className="relative size-5 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-white/10">
                        {featuredList.ownerAvatarUrl && (
                          <Image
                            src={featuredList.ownerAvatarUrl}
                            alt={featuredList.ownerUsername}
                            fill
                            unoptimized
                            sizes="20px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <span>@{featuredList.ownerUsername}</span>
                    </div>
                  </div>
                </div>

                {/* Overlapping Poster Stack */}
                <div className="-space-x-8 flex items-center justify-center py-2 lg:justify-end">
                  {featuredList.games.slice(0, 5).map((game, i) => (
                    <div
                      key={`${game.id || game.slug}-${i}`}
                      className="hover:-translate-y-2 relative aspect-[2/3] w-24 overflow-hidden rounded-xl bg-neutral-900 shadow-2xl ring-2 ring-[#0d0d12] transition-all duration-300 hover:z-20 hover:ring-white/30 sm:w-28"
                      style={{
                        zIndex: 10 - i,
                        transform: `rotate(${(i - 2) * 3}deg)`
                      }}
                    >
                      {game.coverUrl && (
                        <Image
                          src={game.coverUrl}
                          alt={game.name}
                          fill
                          unoptimized
                          sizes="112px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 border-white/[0.08] border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-3.5 text-neutral-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lista, jogo ou autor..."
                className="h-9.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pr-4 pl-9 text-white text-xs outline-none backdrop-blur-md transition-all placeholder:text-neutral-500 hover:border-white/15 focus:border-white/25 focus:bg-white/[0.06]"
              />
            </div>

            {/* Category Tags */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5">
              {CATEGORY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition-all active:scale-[0.96] ${
                      isSelected
                        ? 'bg-white font-semibold text-black shadow-sm'
                        : 'border border-white/[0.08] bg-white/[0.03] text-neutral-400 backdrop-blur-sm hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* My Lists Section */}
        {myLists.length > 0 && !searchQuery.trim() && selectedTag === 'Todas' && (
          <section className="mb-12 space-y-4">
            <div className="flex items-center justify-between border-white/[0.08] border-b pb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-bold font-sans text-sm text-white tracking-tight">
                  Suas Coleções
                </h2>
                <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-medium font-mono text-[11px] text-neutral-400">
                  {myLists.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 font-medium text-neutral-300 text-xs transition-colors hover:text-white"
              >
                <Plus className="size-3.5 text-amber-400" />
                <span>Nova lista</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}

        {/* Community Lists Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-white/[0.08] border-b pb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold font-sans text-sm text-white tracking-tight">
                {selectedTag === 'Todas' ? 'Todas as Coleções' : `Coleções em "${selectedTag}"`}
              </h2>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 font-medium font-mono text-[11px] text-neutral-400">
                {filteredLists.length}
              </span>
            </div>
          </div>

          {filteredLists.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c0c10] p-16 text-center shadow-xl">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-neutral-500">
                <Gamepad2 className="size-7 text-neutral-400" />
              </div>
              <h3 className="mt-4 font-bold text-base text-white">Nenhuma lista encontrada</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-neutral-400 text-xs leading-relaxed">
                Tente ajustar os termos da busca ou selecione outra categoria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('Todas');
                }}
                className="mt-5 font-semibold text-white text-xs underline underline-offset-4"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateListModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <Footer />
    </div>
  );
}

function ListCard({ list }: { list: UserList }) {
  const isOfficial = list.ownerUsername.toLowerCase() === 'joysticked';

  return (
    <Link
      href={`/list?user=${list.ownerUsername}&listname=${list.slug}`}
      className="group hover:-translate-y-1 relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-200 hover:border-white/20 hover:bg-[#121218] hover:shadow-[0_16px_36px_rgba(0,0,0,0.8)]"
    >
      <div>
        {/* Cover Collage */}
        <div className="-space-x-4 flex pt-1 pb-4">
          {list.games.slice(0, 5).map((game, i) => (
            <div
              key={`${game.id || game.slug}-${i}`}
              className="group-hover:-translate-y-1 relative aspect-[2/3] w-13 overflow-hidden rounded-xl bg-neutral-900 shadow-md ring-2 ring-[#0d0d12] transition-all duration-200 group-hover:shadow-lg"
              style={{
                zIndex: 10 - i,
                transitionDelay: `${i * 20}ms`
              }}
            >
              {game.coverUrl && (
                <Image
                  src={game.coverUrl}
                  alt={game.name}
                  fill
                  unoptimized
                  sizes="52px"
                  className="object-cover"
                />
              )}
            </div>
          ))}
          {list.games.length === 0 && (
            <div className="flex aspect-[2/3] w-13 items-center justify-center rounded-xl bg-neutral-900 text-neutral-600 ring-2 ring-[#0d0d12]">
              <Gamepad2 className="size-5" />
            </div>
          )}
        </div>

        {/* Badges */}
        {isOfficial && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-semibold text-[10px] text-amber-300">
              <ShieldCheck className="size-3 text-amber-400" />
              <span>Curadoria Oficial</span>
            </span>
          </div>
        )}

        {/* Title & Description */}
        <h3 className="line-clamp-1 font-bold font-sans text-base text-white transition-colors group-hover:text-amber-300">
          {list.name}
        </h3>
        {list.description && (
          <p className="mt-1.5 line-clamp-2 text-neutral-400 text-xs leading-relaxed [text-wrap:pretty]">
            {list.description}
          </p>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-6 flex items-center justify-between border-white/[0.06] border-t pt-3 text-[11px] text-neutral-400">
        <div className="flex items-center gap-2">
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
              <div className="flex size-full items-center justify-center font-bold text-[8.5px] text-white uppercase">
                {list.ownerUsername[0]}
              </div>
            )}
          </div>
          <span className="truncate font-medium text-neutral-300">@{list.ownerUsername}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-neutral-400">
            <Heart className="size-3 fill-rose-500/40 text-rose-400" />
            <span className="font-mono">{list.likesCount}</span>
          </span>
          <span className="font-mono text-neutral-500">{list.games.length} títulos</span>
        </div>
      </div>
    </Link>
  );
}
