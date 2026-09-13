import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { GameBentoGrid } from '@/components/landing/game-bento-grid';
import { PixelCartridge, PixelGamepad } from '@/components/landing/game-pixel-icons';
import { PixelHeart } from '@/components/landing/pixel-heart';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';

export const metadata: Metadata = {
  title: 'Joysticked — O diário definitivo para suas resenhas de jogos',
  description:
    'Avalie jogos com corações pixelados de meio a cinco, organize seu backlog e compartilhe resenhas sinceras com a comunidade.'
};

const PILLARS = [
  {
    number: '01',
    title: 'Avaliações com alma',
    text: 'Substitua estrelas genéricas por corações 8-bit. Dê notas com precisão de meio ponto para refletir o que realmente sentiu.',
    icon: () => <PixelHeart size={26} variant="full" color="#EF4444" />
  },
  {
    number: '02',
    title: 'Backlog organizado',
    text: 'Separe o que está jogando, o que zerou e o que está na fila. Acompanhe horas jogadas, plataformas e conquistas.',
    icon: () => <PixelGamepad size={26} color="#FFFFFF" />
  },
  {
    number: '03',
    title: 'Comunidade sem bots',
    text: 'Leia análises de quem realmente jogou. Sem notas compradas, sem review bombing artificial e com foco na experiência pura.',
    icon: () => <PixelCartridge size={26} color="#FFFFFF" />
  }
];

export default function WelcomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0A0A0A] text-neutral-100 selection:bg-white/20 selection:text-white">
      {/* Subtle P&B Ambient Background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(40,40,40,0.45),transparent_40%)]" />
      <div className="-translate-x-1/2 pointer-events-none fixed top-0 left-1/2 h-[550px] w-[850px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_65%)] blur-3xl" />

      {/* Floating Top Navigation */}
      <TopNav />

      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex min-h-[82vh] w-full max-w-7xl flex-col items-center justify-center px-4 pt-36 pb-16 text-center sm:px-6 sm:pt-44 lg:pt-48">
        {/* Status Pill with Red Pixel Heart */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-medium text-neutral-300 text-xs backdrop-blur-md transition-colors hover:border-white/20">
          <PixelHeart size={14} variant="full" color="#EF4444" />
          <span className="font-semibold text-white">Joysticked</span>
          <span className="text-neutral-600">•</span>
          <span>O Letterboxd dos seus jogos</span>
        </div>

        {/* Main Headline */}
        <h1 className="mt-7 max-w-4xl font-redaction text-4xl text-white leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
          Registre o que jogou. Encontre sua próxima obsessão.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base text-neutral-400 leading-relaxed sm:text-lg">
          Guarde suas memórias de cada jornada e descubra opiniões sinceras de uma comunidade que
          ama videogames de verdade.
        </p>

        {/* Call to Actions (Monochrome P&B) */}
        <div className="mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center">
          <Link
            href="/games"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-bold text-black text-sm shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all hover:scale-[1.02] hover:bg-neutral-200 active:scale-[0.98]"
          >
            <span>Explorar reviews & jogos</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/home"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-7 font-semibold text-neutral-200 text-sm backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/[0.08] active:scale-[0.98]"
          >
            Ver feed da comunidade
          </Link>
        </div>
      </section>

      {/* Bento Grid: 5 Showcase Panels with Game Review Focus & Red Heart Picker */}
      <GameBentoGrid />

      {/* Core Platform Pillars Section */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h3 className="font-redaction text-2xl text-white sm:text-3xl">
            Tudo o que uma boa análise precisa.
          </h3>
          <p className="mt-2 text-neutral-400 text-xs sm:text-sm">
            Criado com simplicidade e foco naquilo que torna suas memórias com games inesquecíveis.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.number}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#0E0E0E] p-6 transition-all duration-300 hover:border-white/20 hover:bg-[#121212] hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2.5 transition-transform duration-300 group-hover:scale-110">
                      <IconComponent />
                    </div>
                    <span className="font-mono text-neutral-600 text-xs transition-colors group-hover:text-neutral-400">
                      {pillar.number}
                    </span>
                  </div>

                  <h4 className="mt-5 font-semibold text-base text-white tracking-tight">
                    {pillar.title}
                  </h4>
                  <p className="mt-2 text-neutral-400 text-xs leading-relaxed transition-colors group-hover:text-neutral-300">
                    {pillar.text}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 font-mono text-[11px] text-neutral-500 transition-colors group-hover:text-white">
                  <span>Saber mais</span>
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 to-[#0A0A0A] p-8 text-center sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.06),transparent_70%)]" />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.06] p-2.5 shadow-inner">
              <PixelHeart size={28} variant="full" color="#EF4444" />
            </div>

            <h3 className="mt-6 font-bold font-redaction text-3xl text-white tracking-tight sm:text-4xl">
              Sua biblioteca merece um lugar melhor que planilhas esquecidas.
            </h3>
            <p className="mt-4 text-neutral-400 text-sm leading-relaxed sm:text-base">
              Junte-se à comunidade do Joysticked. Registre cada vitória, compartilhe suas resenhas
              e encontre seu próximo jogo favorito.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/games"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 font-bold text-black text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] hover:bg-neutral-200 active:scale-[0.98]"
              >
                Começar a avaliar — É grátis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <Footer />
    </main>
  );
}
