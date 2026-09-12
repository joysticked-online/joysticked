'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronRight, Gamepad2, Layers, Loader2, Sparkles, User } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Logos } from '@/components/logos';
import { TinderCardDeck } from '@/components/onboarding/tinder-card-deck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type PlatformOption = {
  id: string;
  name: string;
  badge: string;
  description: string;
  iconTag: string;
};

const PLATFORMS: PlatformOption[] = [
  {
    id: 'pc',
    name: 'PC / Steam',
    badge: 'Steam',
    description: 'Steam, Epic Games, GOG',
    iconTag: 'PC'
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    badge: 'PS5 / PS4',
    description: 'PlayStation 5 & PlayStation 4',
    iconTag: 'PS'
  },
  {
    id: 'xbox',
    name: 'Xbox',
    badge: 'Series / One',
    description: 'Xbox Series X|S & Game Pass',
    iconTag: 'XB'
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    badge: 'Switch',
    description: 'Switch, OLED & Retro Nintendo',
    iconTag: 'NSW'
  },
  {
    id: 'handheld',
    name: 'Portáteis & Emuladores',
    badge: 'Deck / Retro',
    description: 'Steam Deck, ROG Ally, Portáteis',
    iconTag: 'HD'
  }
];

const GENRES = [
  'RPG',
  'Ação',
  'Souls-like',
  'FPS',
  'Indie',
  'Terror',
  'Roguelike',
  'Mundo Aberto',
  'Estratégia',
  'Plataforma',
  'Metroidvania',
  'Narrativo'
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.16 }
  },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

const itemVariants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 12 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, duration: 0.24, bounce: 0 }
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -10,
    transition: { duration: 0.1 }
  })
};

export function OnboardingFlow({
  isModal = false,
  onClose
}: {
  isModal?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, refetch } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['pc']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['RPG', 'Ação', 'Souls-like']);
  const [likedGameIds, setLikedGameIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Direction tracker for horizontal transition
  const directionRef = useRef(1);

  const goToStep = (next: number) => {
    directionRef.current = next > currentStep ? 1 : -1;
    setCurrentStep(next);
  };

  useEffect(() => {
    if (user) {
      if (user.username && !user.username.startsWith('user_')) {
        setUsername(user.username);
      }
      if (user.displayName && user.displayName !== 'Dev Gamer' && user.displayName !== 'Novo Jogador') {
        setDisplayName(user.displayName);
      }
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('joysticked_session_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.username && !parsed.username.startsWith('user_')) {
            setUsername(parsed.username);
          }
          if (parsed.displayName) {
            setDisplayName(parsed.displayName);
          }
        } catch {}
      }
    }
  }, [user]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleFinish = async (finalLikedIds?: string[]) => {
    setIsSubmitting(true);

    try {
      const currentStored = typeof window !== 'undefined' ? localStorage.getItem('joysticked_session_user') : null;
      let effectiveUser = user;
      if (!effectiveUser && currentStored) {
        try {
          effectiveUser = JSON.parse(currentStored);
        } catch {}
      }

      const finalUsername = username.trim().toLowerCase() || effectiveUser?.username || `player_${Date.now().toString().slice(-4)}`;
      const finalDisplayName = displayName.trim() || finalUsername;
      const gamesToSave = finalLikedIds || likedGameIds;

      const payload = {
        username: finalUsername,
        displayName: finalDisplayName,
        onboardingCompleted: true,
        preferences: {
          platforms: selectedPlatforms,
          genres: selectedGenres,
          likedGames: gamesToSave
        }
      };

      const updatedUser = {
        ...(effectiveUser || {
          id: `usr_${Date.now()}`,
          email: `${finalUsername}@joysticked.com`,
          emailVerified: true,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${finalUsername}`,
          bannerUrl: null,
          bio: '',
          socials: null,
          createdAt: new Date().toISOString()
        }),
        username: finalUsername,
        displayName: finalDisplayName,
        onboardingCompleted: true,
        preferences: payload.preferences
      };

      // 1. Immediately update localStorage & React Query cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('joysticked_session_user', JSON.stringify(updatedUser));
      }
      queryClient.setQueryData(['auth', 'me'], updatedUser);

      // 2. Fire backend update asynchronously without blocking UI navigation
      if (effectiveUser?.id) {
        api.profile({ id: effectiveUser.id }).put(payload).catch((err) => {
          console.warn('API profile update background error:', err);
        });
      }

      toast.success('Perfil configurado!');

      if (onClose) {
        onClose();
      }

      // 3. Guaranteed immediate redirect
      router.push(`/${finalUsername}`);
    } catch {
      toast.error('Erro ao salvar. Redirecionando...');
      router.push(`/${username || 'home'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 4;
  const dir = directionRef.current;
  const previewAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username.trim() || 'gamer'}`;

  const content = (
    <div className="relative flex w-full flex-col font-geist-sans text-white">
      {/* Step Header with Navigation and Segmented Capsule Progress */}
      <header className="flex h-14 w-full items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => goToStep(currentStep - 1)}
              className="flex size-8 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08] transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.96]"
              title="Voltar"
            >
              <ArrowLeft className="size-3.5" />
            </button>
          ) : (
            <div className="size-8" />
          )}
          <Logos.Joysticked className="h-5 opacity-90" />
        </div>

        {/* Minimalist Segmented Indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className={cn(
                  'h-1 rounded-full transition-all duration-250',
                  isCurrent
                    ? 'w-6 bg-white'
                    : isCompleted
                      ? 'w-2.5 bg-white/40'
                      : 'w-2.5 bg-white/10'
                )}
              />
            );
          })}
        </div>

        <div className="w-8 text-right font-mono text-[11px] tabular-nums text-zinc-500">
          {currentStep}/{totalSteps}
        </div>
      </header>

      {/* Step Body */}
      <main className="flex w-full flex-1 flex-col items-center justify-center px-6 py-4">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {/* ── STEP 1: Identity & Handle ── */}
          {currentStep === 1 && (
            <motion.div
              key="onboarding-step-1"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-sm flex-col items-center gap-5 text-center"
            >
              {/* Dynamic Avatar Preview */}
              <motion.div custom={dir} variants={itemVariants} className="relative mt-1">
                <div className="relative size-16 overflow-hidden rounded-2xl bg-white/[0.05] p-1.5 ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                  <img
                    src={previewAvatarUrl}
                    alt="Avatar"
                    className="size-full rounded-xl object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-md bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-black uppercase tracking-wider">
                  BETA
                </div>
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="space-y-1">
                <h1 className="font-redaction text-2xl font-medium tracking-tight text-white [text-wrap:balance]">
                  Criar sua identidade
                </h1>
                <p className="text-xs text-zinc-400 [text-wrap:pretty]">
                  Escolha seu nome público e handle único para seu diário.
                </p>
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full space-y-3.5 text-left">
                <div className="space-y-1.5">
                  <label
                    htmlFor="displayName"
                    className="block text-[11px] font-medium text-zinc-400"
                  >
                    Nome de exibição
                  </label>
                  <Input
                    id="displayName"
                    placeholder="Ex: Pedro Henrique"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 rounded-xl border-0 bg-white/[0.03] px-3.5 text-base sm:text-xs text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="username" className="block text-[11px] font-medium text-zinc-400">
                      Nome de usuário (@handle)
                    </label>
                    <span className="font-mono text-[10px] text-zinc-500">
                      joysticked.com/@{username || 'seu_handle'}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3.5 select-none font-mono text-xs text-zinc-500">
                      @
                    </span>
                    <Input
                      id="username"
                      placeholder="pedro"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                      }
                      className="h-11 rounded-xl border-0 bg-white/[0.03] pl-8 pr-3.5 text-base sm:text-xs text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full pt-1">
                <Button
                  disabled={!username.trim() || username.length < 3}
                  onClick={() => goToStep(2)}
                  className="h-11 w-full rounded-xl bg-white font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96] disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Continuar</span>
                    <ChevronRight className="size-3.5" />
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2: Platforms ── */}
          {currentStep === 2 && (
            <motion.div
              key="onboarding-step-2"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-1">
                <h1 className="font-redaction text-2xl font-medium tracking-tight text-white [text-wrap:balance]">
                  Onde você joga?
                </h1>
                <p className="text-xs text-zinc-400 [text-wrap:pretty]">
                  Selecione as plataformas que você mais utiliza.
                </p>
              </motion.div>

              <motion.div
                custom={dir}
                variants={itemVariants}
                className="grid w-full grid-cols-1 gap-2"
              >
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-150 active:scale-[0.97]',
                        isSelected
                          ? 'bg-white text-black ring-0 shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                          : 'bg-white/[0.03] text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.06]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'flex size-7 items-center justify-center rounded-lg font-mono text-[10px] font-bold',
                            isSelected
                              ? 'bg-black text-white'
                              : 'bg-white/[0.06] text-zinc-400'
                          )}
                        >
                          {platform.iconTag}
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs">
                              {platform.name}
                            </span>
                            <span
                              className={cn(
                                'font-mono text-[9px] uppercase tracking-wider',
                                isSelected ? 'text-black/60' : 'text-zinc-500'
                              )}
                            >
                              {platform.badge}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'text-[10px]',
                              isSelected ? 'text-black/70' : 'text-zinc-500'
                            )}
                          >
                            {platform.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'flex size-4.5 items-center justify-center rounded-full transition-colors',
                          isSelected
                            ? 'bg-black text-white'
                            : 'bg-white/10 text-transparent'
                        )}
                      >
                        {isSelected && <Check className="size-3" strokeWidth={2.5} />}
                      </div>
                    </button>
                  );
                })}
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full pt-1">
                <Button
                  disabled={selectedPlatforms.length === 0}
                  onClick={() => goToStep(3)}
                  className="h-11 w-full rounded-xl bg-white font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96] disabled:opacity-50"
                >
                  Continuar ({selectedPlatforms.length} selecionada{selectedPlatforms.length !== 1 ? 's' : ''})
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 3: Favorite Genres ── */}
          {currentStep === 3 && (
            <motion.div
              key="onboarding-step-3"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-sm flex-col items-center gap-4 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-1">
                <h1 className="font-redaction text-2xl font-medium tracking-tight text-white [text-wrap:balance]">
                  Gêneros favoritos
                </h1>
                <p className="text-xs text-zinc-400 [text-wrap:pretty]">
                  Escolha os estilos que definem o seu gosto.
                </p>
              </motion.div>

              <motion.div
                custom={dir}
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center gap-2 py-2"
              >
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);

                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={cn(
                        'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.96]',
                        isSelected
                          ? 'bg-white text-black ring-0 shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                          : 'bg-white/[0.04] text-zinc-400 ring-1 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                      )}
                    >
                      {genre}
                    </button>
                  );
                })}
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full pt-2">
                <Button
                  disabled={selectedGenres.length === 0}
                  onClick={() => goToStep(4)}
                  className="h-11 w-full rounded-xl bg-white font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96] disabled:opacity-50"
                >
                  Continuar ({selectedGenres.length} escolhido{selectedGenres.length !== 1 ? 's' : ''})
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 4: Discovery Swipe Deck ── */}
          {currentStep === 4 && (
            <motion.div
              key="onboarding-step-4"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-xs flex-col items-center gap-3 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-0.5">
                <h1 className="font-redaction text-2xl font-medium tracking-tight text-white [text-wrap:balance]">
                  Descobrir &amp; Calibrar
                </h1>
                <p className="text-xs text-zinc-400 [text-wrap:pretty]">
                  Deslize para a direita se curte, ou para a esquerda para pular.
                </p>
              </motion.div>

              {/* High-fidelity Drag/Swipe Card Deck */}
              <motion.div custom={dir} variants={itemVariants} className="w-full py-1">
                <TinderCardDeck
                  onRate={(gameId, liked) => {
                    if (liked) {
                      setLikedGameIds((prev) => [...prev, gameId]);
                    }
                  }}
                  onFinish={(likedIds) => {
                    handleFinish(likedIds);
                  }}
                />
              </motion.div>

              {/* Finish Button */}
              <motion.div custom={dir} variants={itemVariants} className="w-full">
                <Button
                  disabled={isSubmitting}
                  onClick={() => handleFinish()}
                  className="h-11 w-full rounded-xl bg-white font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Finalizando configuração…
                    </>
                  ) : (
                    'Concluir e Abrir Perfil'
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          transition={{ type: 'spring', duration: 0.28, bounce: 0 }}
          className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[26px] bg-[#111114]/95 p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.08]"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#08080a] p-4 selection:bg-white selection:text-black">
      {/* Background Matrix */}
      <div 
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,#000_70%,transparent_100%)] opacity-80" 
        aria-hidden="true" 
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[26px] bg-[#111114]/95 p-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-white/[0.08] backdrop-blur-2xl sm:p-4">
        {content}
      </div>
    </div>
  );
}
