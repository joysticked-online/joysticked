/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import type { ProfileGame } from './types';

type ProfileBannerProps = {
  bannerUrl: string | null;
  displayGames: ProfileGame[];
};

export function ProfileBanner({ bannerUrl, displayGames }: ProfileBannerProps) {
  return (
    <div className="relative h-40 w-full overflow-hidden bg-black sm:h-48 md:h-56">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Banner do perfil"
          className="-outline-offset-1 h-full w-full object-cover opacity-75 outline outline-1 outline-white/10"
        />
      ) : (
        /* Rich Atmospheric Game Art Collage Backdrop */
        <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-neutral-900/60 via-neutral-950/80 to-[#070709]">
          {/* Ambient Lighting Blooms */}
          <div className="-top-16 -translate-x-1/2 absolute left-1/3 h-96 w-96 rounded-full bg-indigo-600/25 blur-[140px]" />
          <div className="absolute top-8 right-1/4 h-80 w-80 rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute top-20 left-2/3 h-64 w-64 rounded-full bg-blue-600/15 blur-[100px]" />

          {/* Subtle game artwork fan-out in background */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-around px-16 opacity-25 mix-blend-screen">
            {displayGames.slice(0, 4).map((g, i) => (
              <div
                key={g.id}
                className="hidden h-64 w-44 overflow-hidden rounded-2xl shadow-2xl transition-transform duration-700 md:block"
                style={{
                  transform: `rotate(${(i - 1.5) * 7}deg) translateY(${i % 2 === 0 ? '16px' : '-12px'})`
                }}
              >
                <img src={g.coverUrl} alt="" className="h-full w-full object-cover brightness-60" />
              </div>
            ))}
          </div>

          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_30%,#000_50%,transparent_100%)]" />
        </div>
      )}

      {/* Seamless bottom blend into page background */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070709] via-[#070709]/80 to-transparent" />
    </div>
  );
}
