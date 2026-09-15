import { useEffect, useRef, useState } from 'react';
import type { AuthUser } from '@/hooks/use-auth';

export function useOnboardingState(user: AuthUser | null | undefined) {
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['pc']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['RPG', 'Ação', 'Souls-like']);
  const [likedGameIds, setLikedGameIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const directionRef = useRef(1);

  useEffect(() => {
    if (user) {
      if (user.username && !user.username.startsWith('user_')) setUsername(user.username);
      if (
        user.displayName &&
        user.displayName !== 'Dev Gamer' &&
        user.displayName !== 'Novo Jogador'
      ) {
        setDisplayName(user.displayName);
      }
      return;
    }
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('joysticked_session_user');
    if (!stored) return;
    try {
      const parsed: unknown = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object') return;
      const sessionUser = parsed as Partial<AuthUser>;
      if (sessionUser.username && !sessionUser.username.startsWith('user_'))
        setUsername(sessionUser.username);
      if (sessionUser.displayName) setDisplayName(sessionUser.displayName);
    } catch {
      // Ignore invalid legacy session data.
    }
  }, [user]);

  const goToStep = (next: number) => {
    directionRef.current = next > currentStep ? 1 : -1;
    setCurrentStep(next);
  };
  const togglePlatform = (id: string) => {
    setSelectedPlatforms((platforms) =>
      platforms.includes(id) ? platforms.filter((platform) => platform !== id) : [...platforms, id]
    );
  };
  const toggleGenre = (genre: string) => {
    setSelectedGenres((genres) =>
      genres.includes(genre) ? genres.filter((item) => item !== genre) : [...genres, genre]
    );
  };

  return {
    currentStep,
    directionRef,
    displayName,
    goToStep,
    isSubmitting,
    likedGameIds,
    selectedGenres,
    selectedPlatforms,
    setDisplayName,
    setIsSubmitting,
    setLikedGameIds,
    setUsername,
    toggleGenre,
    togglePlatform,
    username
  };
}
