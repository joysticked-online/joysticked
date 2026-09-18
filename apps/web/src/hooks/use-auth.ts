'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AuthUser {
  id: string;
  username: string;
  displayName?: string | null;
  email: string | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  socials?: any;
  preferences?: any;
  createdAt: string | Date;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const response = await api.auth.me.get({
          fetch: { credentials: 'include' }
        });

        if (response.error) {
          return null;
        }

        return response.data as AuthUser;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  const logout = async () => {
    await api.auth.logout.post(undefined, { fetch: { credentials: 'include' } });
    queryClient.setQueryData(['auth', 'me'], null);
  };

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: Boolean(data),
    error,
    refetch,
    logout,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  };
}
