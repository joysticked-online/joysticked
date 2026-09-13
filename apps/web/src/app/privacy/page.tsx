import { ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/navigation/footer';
import { TopNav } from '@/components/navigation/top-nav';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Joysticked',
  description: 'Saiba como o Joysticked coleta, utiliza e protege os seus dados.'
};

export default function PrivacyPage() {
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
            <Shield className="size-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-white tracking-tight sm:text-3xl">
              Política de Privacidade
            </h1>
            <p className="mt-0.5 text-neutral-400 text-xs">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <div className="space-y-6 text-neutral-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">1. Informações que Coletamos</h2>
            <p>
              O <strong>Joysticked</strong> coleta informações essenciais para proporcionar uma
              experiência personalizada e comunitária de acompanhamento de jogos:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-neutral-400">
              <li>Informações da conta (nome de usuário, e-mail e avatar).</li>
              <li>
                Dados públicos vinculados à conta Steam (ID da Steam, lista de jogos possuídos,
                horas jogadas e conquistas desbloqueadas).
              </li>
              <li>
                Conteúdo gerado pelo usuário (avaliações de jogos, listas personalizadas e notas).
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">2. Como Usamos seus Dados</h2>
            <p>Utilizamos as informações coletadas para:</p>
            <ul className="list-disc space-y-1 pl-5 text-neutral-400">
              <li>Exibir seu perfil de jogador, conquistas e histórico de jogos.</li>
              <li>Sugerir jogos relevantes com base em suas preferências e títulos similares.</li>
              <li>Permitir a interação com a comunidade através de reviews e listas públicas.</li>
              <li>Melhorar continuamente a segurança e a usabilidade da plataforma Joysticked.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">
              3. Segurança e Privacidade da Steam
            </h2>
            <p>
              Nós nunca solicitamos nem temos acesso à sua senha da Steam. A autenticação com a
              Steam é realizada através do OpenID oficial da Valve, garantindo que suas credenciais
              permaneçam em total segurança nos servidores da Valve.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-base text-white">4. Seus Direitos</h2>
            <p>
              Você pode a qualquer momento editar seu perfil, desconectar integrações de terceiros
              ou solicitar a exclusão definitiva de sua conta e avaliações entrando em contato
              através de nossos canais de suporte.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
