'use client';

export function FadeDots({ className = '' }: { className?: string }) {
  return (
    <output aria-label="Carregando..." className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="size-1.5 animate-pulse rounded-full bg-amber-400/80 [animation-delay:0ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-amber-400/80 [animation-delay:200ms]" />
      <span className="size-1.5 animate-pulse rounded-full bg-amber-400/80 [animation-delay:400ms]" />
    </output>
  );
}
