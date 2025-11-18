import { NuqsAdapter } from 'nuqs/adapters/next';
import { Toaster } from '../ui/sonner';
import { QueryProvider } from './query-client-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <NuqsAdapter>
        <Toaster />
        {children}
      </NuqsAdapter>
    </QueryProvider>
  );
}
