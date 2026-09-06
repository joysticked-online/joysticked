'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.auth.me.get({
          fetch: {
            credentials: 'include'
          }
        });

        if (response.error) {
          return null;
        }

        return response.data;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: Boolean(data),
    error,
    refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  };
}
