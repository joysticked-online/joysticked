'use client';

import {
  Calendar,
  Check,
  Edit3,
  Gamepad2,
  MessageSquare,
  Share2,
  Sparkles,
  Twitch,
  Twitter,
  UserCheck,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLATFORM_CONFIG, type Profile, type ProfileGame } from './types';

type ProfileSidebarProps = {
  profile: Profile;
  isOwnProfile: boolean;
  displayGames: ProfileGame[];
};

function formatJoinDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  } catch {
    return 'set. de 2026';
  }
}

export function ProfileSidebar({
  profile,
  isOwnProfile,
  displayGames
}: ProfileSidebarProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  const displayName = profile.displayName || profile.username;
  const socials = profile.socials;
  const platforms = profile.preferences?.platforms || [];
  const genres = profile.preferences?.genres || [];

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link do perfil copiado!');
  }

  function handleCopyDiscord(tag: string) {
    navigator.clipboard.writeText(tag);
    setCopiedDiscord(true);
    toast.success('Discord ID copiado!');
    setTimeout(() => setCopiedDiscord(false), 2000);
  }

  function toggleFollow() {
    setIsFollowing((prev) => !prev);
    toast.success(isFollowing ? 'Deixou de seguir' : `Você agora está seguindo @${profile.username}`);
  }

  return (
    <aside className="space-y-6 lg:col-span-4 xl:col-span-3.5">
      {/* Sleek Side Profile Card Container */}
      <div className="flex flex-col items-center text-center space-y-5  p-6 shadow-1xl">
        {/* Avatar */}
        <div className="relative size-28 overflow-hidden rounded-full bg-neutral-900 shadow-2xl ring-1 ring-white/10 md:size-32">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-900 font-bold text-2xl text-white">
              {initials || '🎮'}
            </div>
          )}
        </div>

        {/* Name + Username */}
        <div className="space-y-1">
          <h1 className="font-bold text-white text-2xl tracking-tight">
            {displayName}
          </h1>

          {/* Username + LVL side-by-side */}
          <div className="flex items-center justify-center gap-2">
            <p className="font-medium text-neutral-500 text-sm">@{profile.username}</p>
          </div>
        </div>

        {/* Member Date Pill */}
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-white/[0.03] px-3.5 py-1 text-xs text-neutral-400">
          <Calendar className="size-3.5 text-neutral-500" strokeWidth={1.5} />
          <span>Membro desde {formatJoinDate(profile.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full items-center justify-center gap-2 pt-1">
          {isOwnProfile ? (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 flex-1 rounded-full border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-neutral-200 hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
            >
              <Link href="/profile">
                <Edit3 className="mr-1.5 size-3.5" strokeWidth={1.5} />
                Editar Perfil
              </Link>
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={toggleFollow}
              className="h-9 flex-1 rounded-full px-4 text-xs font-medium active:scale-[0.96]"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="mr-1.5 size-3.5" strokeWidth={1.5} />
                  Seguindo
                </>
              ) : (
                <>
                  <UserPlus className="mr-1.5 size-3.5" strokeWidth={1.5} />
                  Seguir
                </>
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="icon-sm"
            onClick={handleShare}
            className="size-9 rounded-full border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
            title="Compartilhar perfil"
          >
            <Share2 className="size-3.5" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Clean Stats Numbers */}
        <div className="flex w-full items-center justify-around py-2.5 border-y border-white/[0.04]">
          <div>
            <span className="block font-semibold text-xs text-white">
              {displayGames.length}
            </span>
            <span className="block text-[10px] text-neutral-500 uppercase tracking-wider">Jogos</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div>
            <span className="block font-semibold text-xs text-white">
              {displayGames.filter((g) => g.rating).length}
            </span>
            <span className="block text-[10px] text-neutral-500 uppercase tracking-wider">Reviews</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div>
            <span className="block font-semibold text-xs text-white">
              {isFollowing ? '1' : '0'}
            </span>
            <span className="block text-[10px] text-neutral-500 uppercase tracking-wider">Seguidores</span>
          </div>
          <div className="h-4 w-px bg-white/[0.06]" />
          <div>
            <span className="block font-semibold text-xs text-white">0</span>
            <span className="block text-[10px] text-neutral-500 uppercase tracking-wider">Seguindo</span>
          </div>
        </div>

        {/* Bio Box */}
        {profile.bio && (
          <div className="w-full rounded-3xl bg-white/[0.01] p-3.5 text-center">
            <p className="text-xs leading-relaxed text-neutral-300">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="w-full space-y-2 text-left">
            <h2 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Plataformas
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => {
                const cfg = PLATFORM_CONFIG[p];
                return (
                  <span
                    key={p}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                      cfg ? cfg.color : 'bg-neutral-900 text-neutral-300'
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', cfg?.dotColor || 'bg-neutral-400')} />
                    {cfg?.name || p}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="w-full space-y-2 text-left">
            <h2 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Gêneros Favoritos
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs text-neutral-400"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Socials & Connections */}
        {socials && Object.values(socials).some(Boolean) && (
          <div className="w-full space-y-2 text-left pt-1">
            <h2 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Redes
            </h2>
            <div className="flex flex-wrap gap-2">
              {socials.twitter && (
                <a
                  href={`https://x.com/${socials.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:text-white"
                >
                  <Twitter className="size-3.5" strokeWidth={1.5} />
                  <span>{socials.twitter}</span>
                </a>
              )}
              {socials.twitch && (
                <a
                  href={`https://twitch.tv/${socials.twitch}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:text-white"
                >
                  <Twitch className="size-3.5" strokeWidth={1.5} />
                  <span>{socials.twitch}</span>
                </a>
              )}
              {socials.discord && (
                <button
                  type="button"
                  onClick={() => handleCopyDiscord(socials.discord!)}
                  className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:text-white active:scale-[0.96]"
                >
                  {copiedDiscord ? (
                    <Check className="size-3.5 text-emerald-400" strokeWidth={1.5} />
                  ) : (
                    <MessageSquare className="size-3.5" strokeWidth={1.5} />
                  )}
                  <span>{socials.discord}</span>
                </button>
              )}
              {socials.steam && (
                <a
                  href={`https://steamcommunity.com/id/${socials.steam}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1 text-xs text-neutral-300 hover:text-white"
                >
                  <Gamepad2 className="size-3.5" strokeWidth={1.5} />
                  <span>Steam</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
