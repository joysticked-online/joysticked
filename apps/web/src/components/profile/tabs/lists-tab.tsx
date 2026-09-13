/* biome-ignore-all lint/performance/noImgElement: dynamic external images require native rendering */

'use client';

import { List, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CreateListModal } from '@/components/lists/create-list-modal';
import { type UserList, getUserLists } from '@/lib/lists';
import type { ProfileGame } from '../types';

type ListsTabProps = {
  displayGames?: ProfileGame[];
  username?: string;
  isOwnProfile?: boolean;
};

export function ListsTab({ displayGames = [], username = 'jogador', isOwnProfile = false }: ListsTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const lists = useMemo(() => {
    return getUserLists(username);
  }, [username]);

  if (lists.length === 0) {
    return (
      <>
        <motion.div
          key="lists-empty"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-white/[0.02] p-12 text-center ring-1 ring-white/[0.05]"
        >
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08]">
            <List className="size-5" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm text-white">Nenhuma lista personalizada ainda</p>
            <p className="max-w-xs text-xs text-zinc-400 [text-wrap:pretty]">
              Crie listas temáticas para catalogar franquias, platinas ou recomendações.
            </p>
          </div>
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-medium text-xs text-black transition-all hover:bg-zinc-200 active:scale-[0.96]"
            >
              <Plus className="size-3.5" />
              <span>Criar primeira lista</span>
            </button>
          )}
        </motion.div>

        <CreateListModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div
        key="lists"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        className="space-y-4"
      >
        {isOwnProfile && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/[0.08]"
            >
              <Plus className="size-3.5" />
              <span>Nova Lista</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/list?user=${list.ownerUsername}&listname=${list.slug}`}
              className="group block space-y-3 rounded-2xl bg-white/[0.02] p-5 ring-1 ring-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all hover:bg-white/[0.04] hover:ring-white/[0.1]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-400 ring-1 ring-white/[0.06]">
                  {list.games.length} {list.games.length === 1 ? 'jogo' : 'jogos'}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  {list.likesCount} {list.likesCount === 1 ? 'curtida' : 'curtidas'}
                </span>
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-white tracking-tight group-hover:underline">
                  {list.name}
                </h3>
                {list.description && (
                  <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed [text-wrap:pretty] line-clamp-2">
                    {list.description}
                  </p>
                )}
              </div>
              <div className="-space-x-2.5 flex pt-2">
                {list.games.slice(0, 5).map((g, i) => (
                  <div
                    key={`${g.id || g.slug}-${i}`}
                    className="relative size-11 overflow-hidden rounded-xl bg-neutral-800 ring-2 ring-[#08080a] shadow-md"
                  >
                    {g.coverUrl && (
                      <Image
                        src={g.coverUrl}
                        alt={g.name}
                        fill
                        unoptimized
                        sizes="44px"
                        className="object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      <CreateListModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}
