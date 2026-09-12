'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { OnboardingFlow } from './onboarding-flow';

export function FirstTimeOnboardingGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show if unmounted, loading, unauthenticated, already completed, or on dedicated auth pages
  if (!mounted || isLoading || !isAuthenticated || !user) {
    return null;
  }

  // Already completed onboarding
  if (user.onboardingCompleted) {
    return null;
  }

  // Don't duplicate if already on dedicated onboarding page or auth route
  if (pathname.startsWith('/auth') || pathname.startsWith('/onboarding')) {
    return null;
  }

  return <OnboardingFlow isModal={true} />;
}
