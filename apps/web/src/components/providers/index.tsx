import { NuqsAdapter } from 'nuqs/adapters/next';
import { FirstTimeOnboardingGuard } from '../onboarding/first-time-onboarding-guard';
import { Toaster } from '../ui/sonner';
import { QueryProvider } from './query-client-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <Toaster />
        <FirstTimeOnboardingGuard />
        {children}
      </NuqsAdapter>
    </QueryProvider>
  );
}
