'use client';

import { useForm } from '@tanstack/react-form';
import { ArrowLeft, CheckCircle2, Loader2, Mail, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { requestMagicLink } from '@/actions/request-magic-link';
import { FieldInfo } from '@/components/forms/field-info';
import { Logos } from '@/components/logos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { env } from '@/env';

function AuthContent() {
  const searchParams = useSearchParams();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Handle URL errors (from OAuth or magic link redirects)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'invalid_token') {
      toast.error('The magic link has expired or is invalid. Please request a new one.');
    } else if (error === 'invalid_state') {
      toast.error('Authentication session expired. Please try signing in again.');
    } else if (error === 'oauth_failed') {
      toast.error('Failed to authenticate with social provider. Please try again.');
    }
  }, [searchParams]);

  // Handle resend countdown timer
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
        toast.error(result.error || 'Failed to send magic link');
        return;
      }

      setSubmittedEmail(email);
      setResendCooldown(60);
      toast.success('Magic link deployed to your inbox!');
    }
  });

  const handleResend = async () => {
    if (!submittedEmail || resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const result = await requestMagicLink(submittedEmail);
      if (result.success) {
        setResendCooldown(60);
        toast.success('New magic link sent!');
      } else {
        toast.error(result.error || 'Failed to resend link');
      }
    } finally {
      setIsResending(false);
    }
  };

  const googleAuthUrl = `${env.NEXT_PUBLIC_API_URL}/auth/google`;
  const discordAuthUrl = `${env.NEXT_PUBLIC_API_URL}/auth/discord`;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/5 blur-[140px]" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logos.Joysticked className="h-8" />
        </Link>
      </div>

      {/* Main Auth Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <AnimatePresence mode="wait">
          {!submittedEmail ? (
            /* State 1: Login / Sign-up form */
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1.5 text-center">
                <h1 className="font-medium font-redaction text-3xl text-foreground tracking-tight md:text-4xl">
                  Level Up
                </h1>
                <p className="font-geist-sans text-muted-foreground text-xs md:text-sm">
                  Log in or create your account to track, rate, and review games.
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="flex flex-col gap-2.5">
                <a
                  href={googleAuthUrl}
                  className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-input/20 px-4 font-geist-sans font-medium text-foreground text-sm transition-all hover:border-input/80 hover:bg-input/40 active:scale-[0.99]"
                >
                  <Logos.Google className="size-4" />
                  Continue with Google
                </a>

                <a
                  href={discordAuthUrl}
                  className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-input/20 px-4 font-geist-sans font-medium text-foreground text-sm transition-all hover:border-input/80 hover:bg-input/40 active:scale-[0.99]"
                >
                  <Logos.Discord className="size-4 text-[#5865F2]" />
                  Continue with Discord
                </a>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-border border-t" />
                <span className="absolute bg-card px-3 font-geist-sans text-muted-foreground text-xs uppercase tracking-wider">
                  or email
                </span>
              </div>

              {/* Passwordless Email Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="flex flex-col gap-4"
              >
                <form.Field
                  name="email"
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) return 'Email is required';
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        return 'Please enter a valid email address';
                      }
                    }
                  }}
                >
                  {(field) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="font-geist-sans font-medium text-foreground text-xs"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="player@joysticked.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="h-11 rounded-xl pl-10"
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
                      className="h-11 w-full rounded-xl font-geist-sans font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Deploying Link…
                        </>
                      ) : (
                        'Continue with Magic Link'
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </form>

              <p className="text-center font-geist-sans text-[11px] text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          ) : (
            /* State 2: Check your inbox */
            <motion.div
              key="inbox-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <CheckCircle2 className="size-7" />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="font-medium font-redaction text-2xl text-foreground md:text-3xl">
                  Check Your Inbox
                </h2>
                <p className="font-geist-sans text-muted-foreground text-xs md:text-sm">
                  We've sent a magic sign-in link to:
                </p>
                <p className="font-geist-sans font-medium text-foreground text-sm underline decoration-primary/50 underline-offset-4">
                  {submittedEmail}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-input/20 p-4 font-geist-sans text-muted-foreground text-xs">
                Click the link in the email to automatically log in. The link will expire in{' '}
                <span className="font-semibold text-foreground">15 minutes</span>.
              </div>

              <div className="flex w-full flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="h-10 w-full rounded-xl font-geist-sans text-xs"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Resending…
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend link in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw className="size-3.5" />
                      Resend magic link
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setSubmittedEmail(null)}
                  className="h-10 w-full rounded-xl font-geist-sans text-muted-foreground text-xs hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Use a different email
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
