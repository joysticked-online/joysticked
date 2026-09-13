import type { Game } from '@/lib/games/types';

export interface UserList {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  ownerUsername: string;
  ownerDisplayName?: string | null;
  ownerAvatarUrl?: string | null;
  isPublic: boolean;
  coverGameSlug?: string;
  coverUrl?: string | null;
  games: Game[];
  gameCount: number;
  likesCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
