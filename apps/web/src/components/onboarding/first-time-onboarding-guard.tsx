'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { OnboardingFlow } from './onboarding-flow';

export function FirstTimeOnboardingGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't show if loading, unauthenticated, already completed, or on dedicated auth pages
  if (isLoading || !isAuthenticated || !user) {
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
