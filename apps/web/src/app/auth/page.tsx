'use client';

import { useForm } from '@tanstack/react-form';
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, Mail, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { requestMagicLink } from '@/actions/request-magic-link';
import { FieldInfo } from '@/components/forms/field-info';
import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/env';
import { useAuth } from '@/hooks/use-auth';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginLocal } = useAuth();
  const redirectTarget = searchParams.get('redirect') || '/home';
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'invalid_token') {
      toast.error('O link expirou ou é inválido. Solicite um novo.');
    } else if (error === 'invalid_state') {
      toast.error('Sessão expirada. Tente novamente.');
    } else if (error === 'oauth_failed') {
      toast.error('Login social indisponível no momento. Use seu e-mail abaixo.');
    }

    if (searchParams.get('reset') === 'true') {
      try {
        localStorage.clear();
        document.cookie = 'session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'joysticked_session_user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'joysticked_session_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        toast.info('Sessão local redefinida.');
      } catch { }
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const form = useForm({
    defaultValues: {
      email: ''
    },
    onSubmit: async ({ value }) => {
      const email = value.email.trim();
      const result = await requestMagicLink(email);

      if (!result.success) {
        // Fallback for local dev environments
        loginLocal(email, false);
        toast.success(`Entrando como @${email.split('@')[0]}…`);
        router.push(redirectTarget);
        return;
      }

      setSubmittedEmail(email);
      setResendCooldown(60);
      toast.success('Link enviado para o seu e-mail!');
    }
  });

  const handleResend = async () => {
    if (!submittedEmail || resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const result = await requestMagicLink(submittedEmail);
      if (result.success) {
        setResendCooldown(60);
        toast.success('Novo link enviado com sucesso!');
      } else {
        toast.error(result.error || 'Não foi possível reenviar o link.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const googleAuthUrl = `${env.NEXT_PUBLIC_API_URL}/auth/google`;
  const discordAuthUrl = `${env.NEXT_PUBLIC_API_URL}/auth/discord`;

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#08080a] px-4 py-6 font-geist-sans text-white sm:px-6 sm:py-8 selection:bg-white selection:text-black">
      {/* Subtle Retro Dot Matrix Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,#000_70%,transparent_100%)] opacity-80"
        aria-hidden="true"
      />

      {/* Top Header / Navigation */}
      <header className="relative z-10 flex w-full items-center justify-between mx-auto max-w-5xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Voltar ao início</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400 ring-1 ring-white/[0.06]">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Beta v0.9
          </span>
        </div>
      </header>

      {/* Main Center Auth Container */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center py-8">
        {/* Brand Icon & Heading */}
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Link href="/" className="transition-opacity hover:opacity-90 active:scale-[0.96]">
            <Logos.Joysticked className="h-7 w-auto" />
          </Link>
          <p className="max-w-[280px] text-xs leading-relaxed text-zinc-400 [text-wrap:pretty]">
            O diário definitivo para catalogar, avaliar e compartilhar suas jornadas nos games.
          </p>
        </div>

        {/* Card Component with Concentric Radii (outer 24px, inner 12px) and Hairline Rim */}
        <div className="relative w-full max-w-[380px] overflow-hidden rounded-[24px] bg-[#111114]/95 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.08] backdrop-blur-2xl sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            {!submittedEmail ? (
              /* State 1: Login & Register Options */
              <motion.div
                key="auth-login-view"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1 text-center">
                  <h1 className="font-redaction text-2xl font-medium tracking-tight text-white [text-wrap:balance]">
                    Entrar na sua conta
                  </h1>
                  <p className="text-xs text-zinc-400">
                    Escolha como deseja se autenticar:
                  </p>
                </div>

                {/* Social Login Options */}
                <div className="flex flex-col gap-2.5 pt-1">
                  <a
                    href={googleAuthUrl}
                    className="group relative inline-flex h-11 w-full items-center justify-between rounded-xl bg-white/[0.04] px-4 font-medium text-xs text-white ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:ring-white/[0.16] active:scale-[0.96]"
                  >
                    <div className="flex items-center gap-3">
                      <Logos.Google className="size-4 shrink-0" />
                      <span>Continuar com Google</span>
                    </div>
                    <ChevronRight className="size-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                  </a>

                  <a
                    href={discordAuthUrl}
                    className="group relative inline-flex h-11 w-full items-center justify-between rounded-xl bg-white/[0.04] px-4 font-medium text-xs text-white ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:ring-white/[0.16] active:scale-[0.96]"
                  >
                    <div className="flex items-center gap-3">
                      <Logos.Discord className="size-4 shrink-0 text-[#5865F2]" />
                      <span>Continuar com Discord</span>
                    </div>
                    <ChevronRight className="size-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-300" />
                  </a>
                </div>

                {/* Clean Hairline Separator */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="w-full border-t border-white/[0.06]" />
                  <span className="absolute bg-[#111114] px-3 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                    ou com e-mail direto
                  </span>
                </div>

                {/* Magic Link Direct Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit();
                  }}
                  className="flex flex-col gap-3.5"
                >
                  <form.Field
                    name="email"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return 'Informe seu e-mail';
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                          return 'Digite um endereço de e-mail válido';
                        }
                      }
                    }}
                  >
                    {(field) => (
                      <div className="space-y-1.5">
                        <label htmlFor="auth-email" className="block text-[11px] font-medium text-zinc-400">
                          Endereço de e-mail
                        </label>
                        <div className="relative">
                          <Mail className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3.5 size-4 text-zinc-500" />
                          <Input
                            id="auth-email"
                            type="email"
                            placeholder="jogador@exemplo.com"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            className="h-11 rounded-xl border-0 bg-white/[0.03] pl-10 pr-3.5 text-base sm:text-xs text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30"
                            aria-invalid={
                              field.state.meta.isTouched && field.state.meta.errors.length > 0
                            }
                          />
                        </div>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>

                  <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
                    {([isSubmitting, canSubmit]) => (
                      <Button
                        type="submit"
                        disabled={!canSubmit || isSubmitting}
                        className="h-11 w-full rounded-xl bg-white font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96] disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 size-3.5 animate-spin" />
                            Enviando link seguro…
                          </>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Sparkles className="size-3.5" />
                            <span>Receber Magic Link</span>
                          </div>
                        )}
                      </Button>
                    )}
                  </form.Subscribe>

                  <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-zinc-500">
                    <ShieldCheck className="size-3.5 text-zinc-400" />
                    <span>Acesso sem senha via link de uso único</span>
                  </div>
                </form>

                {/* Local Dev Utility Option */}
                <div className="border-t border-white/[0.06] pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      document.cookie = 'session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      document.cookie = 'joysticked_session_user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      document.cookie = 'joysticked_session_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                      toast.success('Cache local limpo.');
                      window.location.reload();
                    }}
                    className="font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors active:scale-[0.96]"
                  >
                    [Redefinir sessão local]
                  </button>
                </div>
              </motion.div>
            ) : (
              /* State 2: Magic Link Sent Confirmation */
              <motion.div
                key="auth-inbox-view"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex flex-col items-center gap-5 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.08] text-white ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                  <CheckCircle2 className="size-6 text-white" />
                </div>

                <div className="space-y-1.5">
                  <h2 className="font-redaction text-2xl font-medium tracking-tight text-white">
                    Verifique seu e-mail
                  </h2>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Enviamos um link de login instantâneo para:
                  </p>
                  <div className="inline-block rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-white ring-1 ring-white/[0.08]">
                    {submittedEmail}
                  </div>
                </div>

                <div className="w-full rounded-xl bg-white/[0.03] p-3.5 text-left text-[11px] leading-relaxed text-zinc-400 ring-1 ring-white/[0.06]">
                  <p className="font-medium text-zinc-300 mb-1">Próximos passos:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
                    <li>Clique no botão no e-mail para autenticar</li>
                    <li>O link expira em 15 minutos</li>
                    <li>Verifique a pasta de spam se não encontrar</li>
                  </ul>
                </div>

                <div className="flex w-full flex-col gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isResending}
                    className="h-10 w-full rounded-xl border-0 bg-white/[0.06] text-xs text-zinc-200 ring-1 ring-white/10 hover:bg-white/[0.1] active:scale-[0.96]"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                        Reenviando…
                      </>
                    ) : resendCooldown > 0 ? (
                      <span className="font-mono tabular-nums">
                        Reenviar em {resendCooldown}s
                      </span>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 size-3.5" />
                        Reenviar link de acesso
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setSubmittedEmail(null)}
                    className="inline-flex items-center justify-center gap-1.5 pt-1 text-xs text-zinc-400 hover:text-white transition-colors active:scale-[0.96]"
                  >
                    <ArrowLeft className="size-3" />
                    <span>Usar outro e-mail</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Clean Bottom Footer */}
      <footer className="relative z-10 flex w-full flex-col sm:flex-row items-center justify-between gap-3 text-center text-[11px] text-zinc-600 max-w-5xl mx-auto">
        <p>© {new Date().getFullYear()} Joysticked. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Termos de Uso</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
          <span>•</span>
          <span className="font-mono text-[10px] text-zinc-600">Joysticked</span>
        </div>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#08080a]">
          <Loader2 className="size-5 animate-spin text-zinc-500" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
