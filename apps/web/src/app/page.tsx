import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';

export const metadata: Metadata = {
  title: 'Joysticked — encontre seu próximo jogo',
  description: 'Descubra jogos, compartilhe suas notas e encontre sua próxima obsessão.'
};

const PILLARS = [
  {
    number: '01',
    title: 'Descubra',
    text: 'Encontre jogos que combinam com o que você gosta — do hype do momento às joias escondidas.',
    icon: 'discover'
  },
  {
    number: '02',
    title: 'Avalie',
    text: 'Registre o que jogou, dê sua nota e escreva uma opinião que realmente ajuda outras pessoas.',
    icon: 'rate'
  },
  {
    number: '03',
    title: 'Jogue junto',
    text: 'Acompanhe o que a comunidade está jogando e transforme sua biblioteca em uma história.',
    icon: 'together'
  }
];

function PixelIcon({ type }: { type: 'discover' | 'rate' | 'together' }) {
  if (type === 'discover') {
    return (
      <svg aria-hidden="true" className="size-10" viewBox="0 0 40 40" fill="none">
        <path fill="#303030" d="M8 16h4v-4h8v4h8v-4h4v4h4v12h-4v4h-8v-4h-8v4H8z" />
        <path fill="#fff" d="M12 20h4v-4h4v4h4v4h-4v4h-4v-4h-4zM28 20h4v4h-4z" />
      </svg>
    );
  }

  if (type === 'rate') {
    return (
      <svg aria-hidden="true" className="size-10" viewBox="0 0 40 40" fill="none">
        <path fill="#303030" d="M16 8h8v4h4v4h4v12h-4v4H12v-4H8V16h4v-4h4z" />
        <path fill="#fff" d="M16 12h8v4h4v4h-4v4h-8v-4h-4v-4h4zM16 28h8v-4h4v4h-4v4h-8z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-10" viewBox="0 0 40 40" fill="none">
      <path fill="#303030" d="M8 12h8V8h8v4h8v4h4v12h-4v4h-8v-4h-8v4H8z" />
      <path fill="#fff" d="M12 16h8v4h-8zM24 16h4v4h-4zM16 24h8v4h-8z" />
    </svg>
  );
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0A] text-neutral-100 selection:bg-white/20 selection:text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(48,48,48,0.45),transparent_34%)]" />

      <TopNav />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-7xl flex-col items-center justify-center px-5 pt-40 pb-16 text-center sm:px-8 sm:pt-44 lg:pb-24">
        <div className="flex max-w-3xl flex-col items-center">
          <p className="mb-5 flex items-center gap-2 font-medium text-neutral-400 text-xs uppercase tracking-[0.2em]">
            <span className="size-1.5 rounded-full bg-[#303030]" />
            Para quem leva seus jogos a sério
          </p>

          <h1 className="max-w-3xl font-redaction text-4xl text-white leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
            O próximo jogo que vai ficar na sua cabeça.
          </h1>

          <p className="mt-6 max-w-xl text-base text-neutral-400 leading-relaxed sm:text-lg">
            Descubra o que jogar, guarde o que marcou você e encontre uma comunidade que entende por
            que aquele detalhe importa.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/home"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 font-bold text-black text-sm shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-transform hover:scale-[1.02] hover:bg-neutral-200"
            >
              Começar a descobrir
            </Link>
            <Link
              href="/games"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/15 px-6 font-semibold text-neutral-200 text-sm transition-colors hover:border-white/30 hover:bg-white/[0.06]"
            >
              Ver o catálogo
            </Link>
          </div>
        </div>

        <div className="mt-12 grid max-w-5xl grid-cols-1 gap-3 border-white/10 border-t pt-5 text-left sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="group border-white/[0.08] last:border-0 sm:border-r sm:pr-7"
            >
              <div className="flex items-center gap-3 text-[11px] text-neutral-600 sm:block">
                <PixelIcon type={pillar.icon} />
                <span className="font-medium text-neutral-200 text-sm sm:mt-4 sm:block">
                  {pillar.title}
                </span>
              </div>
              <p className="mt-2 max-w-xs text-neutral-500 text-sm leading-relaxed transition-colors group-hover:text-neutral-300 sm:mt-3">
                <span className="mr-2 text-[10px] text-neutral-600">{pillar.number}</span>
                {pillar.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
