'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { OnboardingFlow } from './onboarding-flow';

export function FirstTimeOnboardingGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show if unmounted, loading, unauthenticated, or on dedicated auth/onboarding pages
  if (!mounted || isLoading || !isAuthenticated || !user) {
    return null;
  }

  // Already completed onboarding according to state
  if (user.onboardingCompleted) {
    return null;
  }

  // Check localStorage flag as secondary ground truth
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('joysticked_session_user');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.onboardingCompleted) {
          return null;
        }
      } catch {}
    }
  }

  // Don't duplicate if already on dedicated onboarding page or auth route
  if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  return <OnboardingFlow isModal={true} />;
}
