'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { Logos } from '@/components/logos';
import { env } from '@/env';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Forward full-page navigation to the API endpoint to set the session cookie and redirect
      window.location.href = `${env.NEXT_PUBLIC_API_URL}/auth/verify?token=${encodeURIComponent(token)}`;
    } else {
      router.replace('/auth?error=invalid_token');
    }
  }, [token, router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
      <Logos.Joysticked className="h-8 opacity-80" />
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-xl">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="font-geist-sans text-sm text-foreground">
          Authenticating your session…
        </span>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
