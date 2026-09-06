'use client';

import Link from 'next/link';

import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function TopNav() {
  const { user: currentUser } = useAuth();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <header className="pointer-events-auto flex h-12 w-full max-w-4xl items-center justify-between rounded-full  bg-black/75 px-4 shadow-[0_16px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl transition-all">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity duration-150 ease-out hover:opacity-80 active:scale-[0.96]"
          >
            <Logos.Joysticked className="h-4.5" />
          </Link>

          <nav className="hidden items-center gap-5 text-xs font-medium text-neutral-400 sm:flex">
            <Link href="/" className="transition-colors duration-150 ease-out hover:text-white">
              Início
            </Link>
            <Link href="/games" className="transition-colors duration-150 ease-out hover:text-white">
              Explorar Jogos
            </Link>
            <Link href="/lists" className="transition-colors duration-150 ease-out hover:text-white">
              Listas
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <Link
              href={`/${currentUser.username}`}
              className="flex items-center gap-2 rounded-full  bg-white/[0.04] py-1 ps-1 pe-3 text-xs font-medium text-neutral-300 transition-colors duration-150 ease-out hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
            >
              <div className="size-5.5 overflow-hidden rounded-full bg-neutral-800">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-indigo-950 font-bold text-[9px] text-white">
                    {currentUser.username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <span>@{currentUser.username}</span>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 rounded-full border-white/10 bg-white/[0.04] px-3.5 text-xs text-neutral-200 hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
            >
              <Link href="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </header>
    </div>
  );
}
