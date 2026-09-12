import React from 'react';

export default function Loading() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#070709] font-mono text-white selection:bg-white selection:text-black">
      {/* Subtle CRT Scanline Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.8) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* Main Content Area - Ultra Minimalist & Borderless */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 py-12 select-none">
        {/* Seamless Open Track */}
        <div className="relative mb-12 flex h-16 w-full items-center overflow-hidden">
          {/* Subtle Dashed Pixel Track Line */}
          <div
            className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 4px, transparent 4px, transparent 16px)'
            }}
          />

          {/* Floating Pixel Food Dots */}
          <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 items-center justify-between">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="size-1 bg-white/25"
                style={{ imageRendering: 'pixelated' }}
              />
            ))}
          </div>

          {/* Continuous Moving Chase Scene: [Ghost] ---> [Pac-Man] ---> [Cherries] */}
          <div className="pixel-seamless-chase flex items-center gap-7">
            {/* Ghost (Chaser - following Pac-Man) */}
            <div className="pixel-ghost-bob shrink-0">
              <svg
                width="34"
                height="34"
                viewBox="0 0 16 16"
                fill="none"
                shapeRendering="crispEdges"
                style={{ imageRendering: 'pixelated' }}
              >
                {/* Ghost Body (Solid White) */}
                <path
                  d="M5 1h6v1H5zm-2 1h10v1H3zm-1 1h12v1H2zm-1 1h14v1H1zm0 1h14v1H1zm-1 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm0 1h2v1H0zm3 0h4v1H3zm6 0h4v1H9zm5 0h2v1h-2zm-14 1h1v1H0zm4 0h2v1H4zm6 0h2v1h-2zm5 0h1v1h-1z"
                  fill="#FFFFFF"
                />
                {/* Eyes looking forward / right towards Pac-Man */}
                <rect x="4" y="4" width="4" height="4" fill="#000000" />
                <rect x="6" y="5" width="2" height="2" fill="#FFFFFF" />
                <rect x="10" y="4" width="4" height="4" fill="#000000" />
                <rect x="12" y="5" width="2" height="2" fill="#FFFFFF" />
              </svg>
            </div>

            {/* Pac-Man (Middle - Chasing Cherries while fleeing Ghost) */}
            <div className="shrink-0">
              <div className="pixel-pacman-sprite">
                {/* Frame 1: Open Mouth */}
                <svg
                  className="pacman-frame-open"
                  width="34"
                  height="34"
                  viewBox="0 0 16 16"
                  fill="none"
                  shapeRendering="crispEdges"
                  style={{ imageRendering: 'pixelated' }}
                >
                  <path
                    d="M5 1h6v1H5zm-2 1h10v1H3zm-1 1h12v1H2zm-1 1h14v1H1zm0 1h14v1H1zm-1 1h11v1H0zm0 1h8v1H0zm0 1h8v1H0zm0 1h11v1H0zm1 1h14v1H1zm0 1h14v1H1zm1 1h12v1H2zm1 1h10v1H3zm2 1h6v1H5z"
                    fill="#FFFFFF"
                  />
                </svg>

                {/* Frame 2: Half Open Mouth */}
                <svg
                  className="pacman-frame-half"
                  width="34"
                  height="34"
                  viewBox="0 0 16 16"
                  fill="none"
                  shapeRendering="crispEdges"
                  style={{ imageRendering: 'pixelated' }}
                >
                  <path
                    d="M5 1h6v1H5zm-2 1h10v1H3zm-1 1h12v1H2zm-1 1h14v1H1zm0 1h14v1H1zm-1 1h14v1H0zm0 1h11v1H0zm0 1h11v1H0zm0 1h14v1H0zm1 1h14v1H1zm0 1h14v1H1zm1 1h12v1H2zm1 1h10v1H3zm2 1h6v1H5z"
                    fill="#FFFFFF"
                  />
                </svg>

                {/* Frame 3: Closed Mouth */}
                <svg
                  className="pacman-frame-closed"
                  width="34"
                  height="34"
                  viewBox="0 0 16 16"
                  fill="none"
                  shapeRendering="crispEdges"
                  style={{ imageRendering: 'pixelated' }}
                >
                  <path
                    d="M5 1h6v1H5zm-2 1h10v1H3zm-1 1h12v1H2zm-1 1h14v1H1zm0 1h14v1H1zm-1 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm0 1h16v1H0zm1 1h14v1H1zm0 1h14v1H1zm1 1h12v1H2zm1 1h10v1H3zm2 1h6v1H5z"
                    fill="#FFFFFF"
                  />
                </svg>
              </div>
            </div>

            {/* Pixel Cherries (Prize in Front) */}
            <div className="pixel-cherry-bounce shrink-0">
              <svg
                width="34"
                height="34"
                viewBox="0 0 16 16"
                fill="none"
                shapeRendering="crispEdges"
                style={{ imageRendering: 'pixelated' }}
              >
                {/* Stem join and branches */}
                <path
                  d="M10 1h2v1h-2zM9 2h2v1H9zM8 3h2v1H8zM7 4h2v1H7zM4 5h4v1H4zM3 6h2v1H3zM2 7h2v1H2zM8 5h2v2H8zM9 7h2v1H9z"
                  fill="#71717A"
                />
                {/* Left Cherry Body */}
                <path
                  d="M1 8h4v1H1zM0 9h6v1H0zM0 10h6v1H0zM0 11h6v1H0zM1 12h4v1H1z"
                  fill="#FFFFFF"
                />
                {/* Left Cherry Shine */}
                <rect x="1" y="9" width="1" height="1" fill="#000000" />
                {/* Right Cherry Body */}
                <path
                  d="M8 8h4v1H8zM7 9h6v1H7zM7 10h6v1H7zM7 11h6v1H7zM8 12h4v1H8z"
                  fill="#FFFFFF"
                />
                {/* Right Cherry Shine */}
                <rect x="8" y="9" width="1" height="1" fill="#000000" />
              </svg>
            </div>
          </div>
        </div>

        {/* Minimalist Pixel Loading Indicator */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-white">
            <span className="inline-block size-1.5 bg-white animate-pulse" />
            <span>CARREGANDO</span>
            <span className="inline-flex gap-1">
              <span className="size-1 bg-white animate-bounce" style={{ animationDelay: '0s' }} />
              <span className="size-1 bg-white animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="size-1 bg-white animate-bounce" style={{ animationDelay: '0.3s' }} />
            </span>
          </div>
          <p className="text-[10px] tracking-[0.18em] text-neutral-500 uppercase">
            Preparando jogos e avaliações...
          </p>
        </div>
      </div>

      {/* Embedded Pixel CSS Animations */}
      <style>{`
        @keyframes pixelSeamlessTrack {
          0% {
            transform: translateX(-180px);
          }
          100% {
            transform: translateX(680px);
          }
        }

        @keyframes ghostStep {
          0%, 100% {
            transform: translateY(-2px);
          }
          50% {
            transform: translateY(2px);
          }
        }

        @keyframes cherryHover {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(4deg);
          }
        }

        .pixel-seamless-chase {
          animation: pixelSeamlessTrack 3.4s linear infinite;
        }

        .pixel-ghost-bob {
          animation: ghostStep 0.28s steps(2, jump-none) infinite;
        }

        .pixel-cherry-bounce {
          animation: cherryHover 0.6s ease-in-out infinite;
        }

        /* 3-frame pixel Pac-Man animation using pure CSS step cycle */
        .pixel-pacman-sprite {
          position: relative;
          width: 34px;
          height: 34px;
        }

        .pixel-pacman-sprite svg {
          position: absolute;
          inset: 0;
        }

        .pacman-frame-open {
          animation: frameOpen 0.22s steps(1) infinite;
        }
        .pacman-frame-half {
          animation: frameHalf 0.22s steps(1) infinite;
        }
        .pacman-frame-closed {
          animation: frameClosed 0.22s steps(1) infinite;
        }

        @keyframes frameOpen {
          0%, 100% { opacity: 1; visibility: visible; }
          33.33% { opacity: 0; visibility: hidden; }
          66.66% { opacity: 0; visibility: hidden; }
        }

        @keyframes frameHalf {
          0%, 100% { opacity: 0; visibility: hidden; }
          33.33% { opacity: 1; visibility: visible; }
          66.66% { opacity: 0; visibility: hidden; }
        }

        @keyframes frameClosed {
          0%, 100% { opacity: 0; visibility: hidden; }
          33.33% { opacity: 0; visibility: hidden; }
          66.66% { opacity: 1; visibility: visible; }
        }
      `}</style>
    </div>
  );
}
