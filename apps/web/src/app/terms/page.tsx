import { ArrowLeft, FileText } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';

export const metadata: Metadata = {
  title: 'Termos de Serviço | Joysticked',
  description: 'Leia os termos e condições de uso da plataforma Joysticked.'
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 selection:bg-white/20 selection:text-white">
      <TopNav />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-24 pb-20 sm:px-6 sm:pt-28">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-neutral-400 text-xs transition-colors hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          <span>Voltar ao Início</span>
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.05]">
            <FileText className="size-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-white tracking-tight sm:text-3xl">
              Termos de Serviço
            </h1>
            <p className="mt-0.5 text-neutral-400 text-xs">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma <strong>Joysticked</strong>, você concorda em
              cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com
              qualquer parte destes termos, você não deve utilizar a plataforma.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">2. Uso da Conta e Conduta</h2>
            <p>
              Você é responsável por manter a confidencialidade das credenciais de sua conta e por
              todas as atividades que ocorram sob seu perfil. Ao interagir na comunidade, você
              concorda em:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-neutral-400">
              <li>Não publicar conteúdo ofensivo, difamatório, discriminatório ou ilegal.</li>
              <li>
                Não praticar spam, assédio ou qualquer forma de abuso contra outros jogadores.
              </li>
              <li>
                Publicar avaliações genuínas e respeitosas baseadas em suas experiências reais de
                gameplay.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">3. Propriedade Intelectual</h2>
            <p>
              Todos os direitos relativos a marcas, dados de jogos (como capas, descrições e banners
              providos pelo IGDB) pertencem a seus respectivos proprietários e publicadoras. O
              Joysticked utiliza esses dados sob fair use informativo para catalogação e revisão
              comunitária.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">4. Modificações nos Termos</h2>
            <p>
              O Joysticked reserva-se o direito de atualizar ou modificar estes Termos a qualquer
              momento. O uso contínuo da plataforma após tais alterações constitui sua aceitação dos
              novos Termos.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
