'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Logos } from '@/components/logos';
import { api } from '@/lib/api';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const redirectTarget = searchParams.get('redirect') || '/home';

    if (!token) {
      router.replace('/auth?error=oauth_failed');
      return;
    }

    // Set cookie on the client web domain (localhost:3000)
    document.cookie = `session=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

    try {
      localStorage.setItem('joysticked_session_token', token);
    } catch {}

    let parsedUser = null;
    if (userParam) {
      try {
        parsedUser = JSON.parse(userParam);
        localStorage.setItem('joysticked_session_user', JSON.stringify(parsedUser));
        queryClient.setQueryData(['auth', 'me'], parsedUser);
      } catch (e) {
        console.warn('Failed to parse user param:', e);
      }
    }

    // Also fetch fresh user profile with the bearer token to ensure cache consistency
    api.auth.me
      .get({
        fetch: {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      })
      .then((res) => {
        if (res.data) {
          try {
            localStorage.setItem('joysticked_session_user', JSON.stringify(res.data));
          } catch {}
          queryClient.setQueryData(['auth', 'me'], res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not sync user profile from API:', err);
      })
      .finally(() => {
        // Redirect to target destination
        router.replace(redirectTarget);
      });
  }, [router, searchParams, queryClient]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background px-4">
      <Logos.Joysticked className="h-8 opacity-80" />
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-xl">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="font-geist-sans text-foreground text-sm">
          Entrando na sua conta...
        </span>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
