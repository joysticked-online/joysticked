'use client';

import {
  Compass,
  Filter,
  Gamepad2,
  Heart,
  ListPlus,
  Plus,
  Search,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CreateListModal } from '@/components/lists/create-list-modal';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';
import { useAuth } from '@/hooks/use-auth';
import { DEFAULT_COMMUNITY_LISTS, type UserList, getAllLists, getUserLists } from '@/lib/lists';

const CATEGORY_TAGS = ['Todas', 'Favoritos', 'Souls-like', 'Indie', 'Narrativa', 'RPG', 'Clássicos'];

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
  }, [currentUser, mounted, allLists]);

  const filteredLists = useMemo(() => {
    let list = allLists;

    if (selectedTag !== 'Todas') {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter(
        (l) =>
          l.tags?.some((t) => t.toLowerCase().includes(tagLower)) ||
          l.name.toLowerCase().includes(tagLower) ||
          (l.description && l.description.toLowerCase().includes(tagLower))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          l.ownerUsername.toLowerCase().includes(q) ||
          (l.ownerDisplayName && l.ownerDisplayName.toLowerCase().includes(q)) ||
          l.games.some((g) => g.name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allLists, selectedTag, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
      <TopNav />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-24 sm:px-6 sm:pt-28 md:px-8">
        {/* Header Hero */}
        <div className="mb-8 space-y-4 sm:mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-neutral-300">
                  <Compass className="size-3 text-amber-400" />
                  <span>Comunidade</span>
                </span>
              </div>
              <h1 className="mt-2 font-sans text-2xl font-bold text-white tracking-tight sm:text-4xl md:text-5xl">
                Listas de Jogos
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Descubra coleções temáticas, rankings pessoais e seleções curadas pelos jogadores da comunidade.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-5 text-xs font-semibold text-black shadow-lg transition-all hover:bg-neutral-200 active:scale-95 shrink-0"
            >
              <ListPlus className="size-4" />
              <span>Criar Nova Lista</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-white/[0.06]">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por lista ou autor..."
                className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-4 text-xs text-white placeholder:text-neutral-500 outline-none transition-all hover:border-white/15 focus:border-white/25 focus:bg-white/[0.06]"
              />
            </div>

            {/* Category Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'border border-white/[0.06] bg-white/[0.03] text-neutral-400 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* My Lists (If user is logged in and has lists) */}
        {myLists.length > 0 && !searchQuery.trim() && selectedTag === 'Todas' && (
          <section className="mb-10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <h2 className="font-sans text-xs font-bold text-neutral-400 tracking-wider uppercase">
                Suas Listas ({myLists.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-white transition-colors"
              >
                <Plus className="size-3.5" />
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
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <h2 className="font-sans text-xs font-bold text-neutral-400 tracking-wider uppercase">
              {selectedTag === 'Todas' ? 'Listas da Comunidade' : `Listas com "${selectedTag}"`} ({filteredLists.length})
            </h2>
          </div>

          {filteredLists.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-16 text-center">
              <Gamepad2 className="mx-auto size-12 text-neutral-600" />
              <h3 className="mt-3 font-semibold text-white text-sm">Nenhuma lista encontrada</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Tente ajustar os termos da busca ou filtro de categoria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('Todas');
                }}
                className="mt-4 text-xs font-semibold text-white underline underline-offset-4"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  return (
    <Link
      href={`/list?user=${list.ownerUsername}&listname=${list.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101014] p-5 shadow-sm transition-all hover:border-white/20 hover:bg-[#14141a] hover:shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
    >
      <div>
        {/* Cover Collage */}
        <div className="-space-x-3 flex pb-3.5">
          {list.games.slice(0, 5).map((game, i) => (
            <div
              key={`${game.id || game.slug}-${i}`}
              className="relative aspect-[2/3] w-12 overflow-hidden rounded-xl bg-neutral-800 ring-2 ring-[#101014] shadow-md transition-transform group-hover:-translate-y-1"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {game.coverUrl && (
                <Image
                  src={game.coverUrl}
                  alt={game.name}
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
          ))}
          {list.games.length === 0 && (
            <div className="flex size-12 items-center justify-center rounded-xl bg-neutral-800 text-neutral-600 ring-2 ring-[#101014]">
              <Gamepad2 className="size-5" />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="line-clamp-1 font-sans text-base font-bold text-white group-hover:text-white transition-colors">
          {list.name}
        </h3>
        {list.description && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-400 leading-relaxed [text-wrap:pretty]">
            {list.description}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.04] pt-3 text-[11px] text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="relative size-5 shrink-0 overflow-hidden rounded-full bg-neutral-800 border border-white/10">
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
              <div className="flex size-full items-center justify-center text-[8.5px] font-bold text-white uppercase">
                {list.ownerUsername[0]}
              </div>
            )}
          </div>
          <span className="truncate text-neutral-300">@{list.ownerUsername}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-neutral-400">
            <Heart className="size-3 fill-neutral-600 text-neutral-600" />
            <span>{list.likesCount}</span>
          </span>
          <span className="tabular-nums text-neutral-400">{list.games.length} jogos</span>
        </div>
      </div>
    </Link>
  );
}
