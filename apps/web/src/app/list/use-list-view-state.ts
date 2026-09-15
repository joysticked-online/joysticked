import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/games';
import {
  addGameToUserList,
  DEFAULT_COMMUNITY_LISTS,
  deleteUserList,
  getAllLists,
  getListByUserAndSlug,
  removeGameFromUserList,
  toggleLikeList,
  type UserList
} from '@/lib/lists';
import { getListStats, type ViewMode } from './list-view-model';

export function useListViewState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const targetUser = searchParams.get('user') || searchParams.get('username') || '';
  const targetListSlug =
    searchParams.get('listname') ||
    searchParams.get('lsitname') ||
    searchParams.get('list') ||
    searchParams.get('name') ||
    searchParams.get('id') ||
    '';
  const [list, setList] = useState<UserList | null>(DEFAULT_COMMUNITY_LISTS[0] || null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [otherLists, setOtherLists] = useState<UserList[]>(DEFAULT_COMMUNITY_LISTS.slice(0, 4));
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void (async () => {
      const all = await getAllLists();
      const found = !targetListSlug && !targetUser ? all[0] || DEFAULT_COMMUNITY_LISTS[0] : await getListByUserAndSlug(targetUser, targetListSlug);
      setList(found || null);
      if (found) { setLikesCount(found.likesCount); setOtherLists(all.filter((item) => item.id !== found.id).slice(0, 4)); }
    })();
  }, [targetListSlug, targetUser]);

  const isOwner = Boolean(
    currentUser &&
      list &&
      (currentUser.username.toLowerCase() === list.ownerUsername.toLowerCase() ||
        list.ownerUsername === 'jogador')
  );
  const isOfficial = list?.ownerUsername.toLowerCase() === 'joysticked';
  const listStats = useMemo(() => getListStats(list), [list]);

  const handleLikeToggle = async () => {
    if (!list) return;
    const result = await toggleLikeList(list.id);
    setLiked(result.isLiked);
    setLikesCount((count) => Math.max(0, count + (result.isLiked ? 1 : -1)));
  };
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  const handleAddGame = async (game: Game) => {
    if (!list) return;
    const updated = await addGameToUserList(list.id, game);
    if (updated) setList(updated);
  };
  const handleRemoveGame = async (gameSlugOrId: string | number) => {
    if (!list) return;
    const updated = await removeGameFromUserList(list.id, gameSlugOrId);
    if (updated) setList(updated);
  };
  const handleDeleteList = async () => {
    if (!list || !confirm(`Tem certeza que deseja excluir a lista "${list.name}"?`)) return;
    await deleteUserList(list.id);
    router.push('/lists');
  };

  return {
    copied,
    currentUser,
    handleAddGame,
    handleDeleteList,
    handleLikeToggle,
    handleRemoveGame,
    handleShare,
    isAddGameOpen,
    isCreateOpen,
    isEditOpen,
    isOfficial,
    isOwner,
    liked,
    likesCount,
    list,
    listStats,
    mounted,
    otherLists,
    setIsAddGameOpen,
    setIsCreateOpen,
    setIsEditOpen,
    setList,
    setViewMode,
    targetListSlug,
    targetUser,
    viewMode
  };
}
