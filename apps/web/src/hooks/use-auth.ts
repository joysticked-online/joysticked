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
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('joysticked_session_token') : null;

        const response = await api.auth.me.get({
          fetch: {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        });

        if (response.error) {
          // Check local session fallback
          if (typeof window !== 'undefined') {
            const local = localStorage.getItem('joysticked_session_user');
            if (local) {
              try {
                return JSON.parse(local) as AuthUser;
              } catch {}
            }
          }
          return null;
        }

        const userData = response.data as AuthUser;
        if (typeof window !== 'undefined' && userData) {
          try {
            const local = localStorage.getItem('joysticked_session_user');
            if (local) {
              const parsed = JSON.parse(local);
              if (parsed.onboardingCompleted) {
                userData.onboardingCompleted = true;
              }
              if (parsed.username && !parsed.username.startsWith('user_')) {
                userData.username = parsed.username;
              }
              if (
                parsed.displayName &&
                parsed.displayName !== 'Novo Jogador' &&
                parsed.displayName !== 'Dev Gamer'
              ) {
                userData.displayName = parsed.displayName;
              }
              if (parsed.preferences) {
                userData.preferences = parsed.preferences;
              }
            }
            localStorage.setItem('joysticked_session_user', JSON.stringify(userData));
          } catch {}
        }

        return userData;
      } catch {
        if (typeof window !== 'undefined') {
          const local = localStorage.getItem('joysticked_session_user');
          if (local) {
            try {
              return JSON.parse(local) as AuthUser;
            } catch {}
          }
        }
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  const loginLocal = (identifier = 'jogador', onboardingCompleted = false) => {
    const rawName = identifier.includes('@') ? identifier.split('@')[0] : identifier;
    const tempId = Date.now().toString().slice(-4);
    const username = `user_${tempId}`;
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      username,
      displayName: rawName,
      email: identifier.includes('@') ? identifier : `${username}@joysticked.com`,
      emailVerified: true,
      onboardingCompleted,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${rawName}`,
      bannerUrl: null,
      bio: '',
      socials: null,
      preferences: null,
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('joysticked_session_user', JSON.stringify(newUser));
      localStorage.setItem('joysticked_session_token', `mock_token_${Date.now()}`);
      document.cookie = `session=mock_token_${Date.now()}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
    queryClient.setQueryData(['auth', 'me'], newUser);
    return newUser;
  };

  const logoutLocal = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('joysticked_session_user');
      localStorage.removeItem('joysticked_session_token');
      document.cookie = 'session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie =
        'joysticked_session_user=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie =
        'joysticked_session_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    queryClient.setQueryData(['auth', 'me'], null);
  };

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: Boolean(data),
    error,
    refetch,
    loginLocal,
    logoutLocal,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  };
}
