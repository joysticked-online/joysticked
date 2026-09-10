import { TopNav } from '@/components/navigation/top-nav';
import { FadeDots } from '@/components/ui/fade-dots';

export default function GameLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
      {/* Centralized Floating Capsule Bar */}
      <TopNav />

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 pt-20 pb-20 sm:px-6 sm:pt-24">
        {/* Banner Skeleton */}
        <div className="relative mx-auto flex h-48 w-full animate-pulse items-center justify-end overflow-hidden bg-neutral-900/60 px-6 shadow-inner sm:h-56 md:h-64 lg:h-72">
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-neutral-950/60 px-3 py-1 backdrop-blur-md">
            <span className="font-medium text-[11px] text-neutral-400">Carregando jogo</span>
            <FadeDots />
          </div>
          {/* Seamless Bottom Fade on Skeleton */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-neutral-950 to-transparent" />
        </div>

        {/* Hero Overlap Info */}
        <div className="relative z-10 -mt-10 px-4 sm:-mt-14 md:-mt-16">
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            {/* Poster Skeleton */}
            <div className="mx-auto aspect-[2/3] w-20 flex-shrink-0 animate-pulse rounded-xl border border-white/10 bg-neutral-850/80 shadow-xl sm:w-24 md:mx-0 md:w-28" />

            {/* Details Skeleton */}
            <div className="w-full flex-1 space-y-3 pt-1">
              {/* Date & Genre Tags */}
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-24 animate-pulse rounded-full bg-neutral-800/80" />
                <div className="h-3.5 w-16 animate-pulse rounded-full bg-neutral-800/60" />
              </div>

              {/* Title Skeleton */}
              <div className="h-7 w-3/4 max-w-md animate-pulse rounded-lg bg-neutral-800/90 sm:h-8" />

              {/* Action Buttons Skeleton */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="h-8 w-28 animate-pulse rounded-full bg-neutral-800/70" />
                <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-800/60" />
                <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-800/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Skeleton Lines */}
        <div className="space-y-2 px-2 pt-4">
          <div className="h-3.5 w-full animate-pulse rounded bg-neutral-900/80" />
          <div className="h-3.5 w-5/6 animate-pulse rounded bg-neutral-900/70" />
          <div className="h-3.5 w-4/6 animate-pulse rounded bg-neutral-900/60" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-2 border-white/[0.06] border-b px-2 pt-4 pb-3">
          <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-800/80" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-neutral-900/60" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-900/60" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-neutral-900/60" />
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl border border-white/[0.03] bg-neutral-900/40" />
          <div className="h-28 animate-pulse rounded-2xl border border-white/[0.03] bg-neutral-900/40" />
        </div>
      </main>
    </div>
  );
}
