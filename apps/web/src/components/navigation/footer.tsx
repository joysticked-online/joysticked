import Link from 'next/link';
import { Logos } from '@/components/logos';

export function Footer() {
  return (
    <footer className="mt-auto w-full border-white/[0.05] border-t bg-neutral-950/80 py-10 text-neutral-400 text-xs">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row md:px-8">
        {/* Left: Branding & Tagline */}
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <Link
            href="/"
            className="flex items-center gap-2 text-white transition-opacity hover:opacity-80"
          >
            <div className="flex size-6 items-center justify-center rounded-full bg-white/[0.06] p-1">
              <Logos.Joysticked className="size-full text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Joysticked</span>
          </Link>
          <span className="hidden text-neutral-600 sm:inline">|</span>
          <span className="text-neutral-500">Play, rate & discover your next obsession.</span>
        </div>

        {/* Right: Legal & Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          <Link
            href="/privacy"
            className="underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Política de Privacidade
          </Link>
          <Link
            href="/terms"
            className="underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Termos de Serviço
          </Link>
          <Link
            href="/community"
            className="underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Comunidade
          </Link>
          <span className="text-[11px] text-neutral-600">
            © {new Date().getFullYear()} Joysticked
          </span>
        </div>
      </div>
    </footer>
  );
}
