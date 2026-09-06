'use client';

import {
  Gamepad2,
  Monitor,
  Smartphone
} from 'lucide-react';

interface GamePlatformsProps {
  platforms: string[];
}

function getPlatformIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('pc') || lower.includes('windows') || lower.includes('mac') || lower.includes('linux')) {
    return <Monitor className="size-3.5 text-neutral-400" />;
  }
  if (lower.includes('ios') || lower.includes('android')) {
    return <Smartphone className="size-3.5 text-neutral-400" />;
  }
  return <Gamepad2 className="size-3.5 text-neutral-400" />;
}

export function GamePlatforms({ platforms }: GamePlatformsProps) {
  if (!platforms || platforms.length === 0) {
    return <p className="text-xs text-neutral-500">Nenhuma plataforma informada</p>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {platforms.map((platform) => (
        <span
          key={platform}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        >
          {getPlatformIcon(platform)}
          <span>{platform}</span>
        </span>
      ))}
    </div>
  );
}
