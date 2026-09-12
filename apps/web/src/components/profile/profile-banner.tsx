/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import type { ProfileGame } from './types';

type ProfileBannerProps = {
  bannerUrl: string | null;
  displayGames: ProfileGame[];
};

export function ProfileBanner({ bannerUrl, displayGames }: ProfileBannerProps) {
  return (
    <div className="relative h-44 w-full overflow-hidden bg-[#08080a] sm:h-52 md:h-64">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Banner do perfil"
          className="h-full w-full object-cover opacity-60"
        />
      ) : (
        /* High-contrast Monochrome Retro Arcade & Fan-out Backdrop */
        <div className="relative h-full w-full overflow-hidden bg-[#08080a]">
          {/* Subtle Retro Dot Matrix Mask */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0c_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_60%,transparent_100%)] opacity-80"
            aria-hidden="true"
          />

          {/* Monochrome Game Poster Fan-out in Background */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-around px-12 opacity-15 grayscale contrast-125">
            {displayGames.slice(0, 5).map((g, i) => (
              <div
                key={g.id}
                className="hidden h-64 w-44 overflow-hidden rounded-2xl ring-1 ring-white/10 md:block"
                style={{
                  transform: `rotate(${(i - 2) * 6}deg) translateY(${i % 2 === 0 ? '12px' : '-8px'})`
                }}
              >
                <img src={g.coverUrl} alt="" className="h-full w-full object-cover brightness-50" />
              </div>
            ))}
          </div>

          {/* Top Hairline Ambient Inset */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}

      {/* Seamless Bottom Vignette Fade into Page */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#08080a] via-[#08080a]/80 to-transparent" />
    </div>
  );
}
