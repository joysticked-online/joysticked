'use client';

import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
};

const PLATFORMS: PlatformOption[] = [
  {
    id: 'pc',
    name: 'PC / Steam',
    badge: 'Steam',
    description: 'Steam, Epic Games, GOG'
  },
  {
    id: 'playstation',
    name: 'PlayStation 5',
    badge: 'PS5',
    description: 'PlayStation 5 & PS4'
  },
  {
    id: 'xbox',
    name: 'Xbox Series X|S',
    badge: 'Xbox',
    description: 'Series X|S & Game Pass'
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    badge: 'Switch',
    description: 'Nintendo Switch & OLED'
  },
  {
    id: 'handheld',
    name: 'Handheld & Retro',
    badge: 'Retro',
    description: 'Steam Deck, ROG Ally, Emulação'
  }
];

const GENRES = [
  'RPG',
  'Action-Adventure',
  'Souls-like',
  'FPS / Shooter',
  'Indie',
  'Survival Horror',
  'Roguelike',
  'Open World',
  'Strategy',
  'Platformer',
  'Cyberpunk',
  'Fighting',
  'Racing',
  'MMO',
  'Metroidvania',
  'Story Rich'
];

// Per-step ambient gradient hues — crossfade between steps
const STEP_GRADIENTS = [
  'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)', // indigo — step 1
  'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(139,92,246,0.18) 0%, transparent 70%)', // violet — step 2
  'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(16,185,129,0.15) 0%, transparent 70%)', // emerald — step 3
  'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(245,158,11,0.15) 0%, transparent 70%)'  // amber — step 4
];

// Stagger container + item variants
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  exit: {}
};

const itemVariants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 24, y: 4 }),
  show: { opacity: 1, x: 0, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 30 } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -16, y: -4, transition: { duration: 0.12, ease: 'easeIn' as const } })
};

export function OnboardingFlow({
  isModal = false,
  onClose
}: {
  isModal?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const { user, refetch } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['pc', 'playstation']);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['RPG', 'Action-Adventure']);
  const [likedGameIds, setLikedGameIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track navigation direction for horizontal slide
  const directionRef = useRef(1); // 1 = forward, -1 = backward

  const goToStep = (next: number) => {
    directionRef.current = next > currentStep ? 1 : -1;
    setCurrentStep(next);
  };

  // Initialize with current user info
  useEffect(() => {
    if (user) {
      if (user.username && !user.username.startsWith('user_')) {
        setUsername(user.username);
      }
      if (user.displayName) {
        setDisplayName(user.displayName);
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
    if (!user) return;
    setIsSubmitting(true);

    try {
      const finalUsername = username.trim() || user.username;
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

      const { error } = await api.profile({ id: user.id }).put(payload);

      if (error) {
        const msg =
          typeof error.value === 'object' && error.value && 'message' in error.value
            ? String((error.value as { message?: string }).message)
            : 'Falha ao salvar o perfil';
        toast.error(msg);
        return;
      }

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('joysticked_session_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localStorage.setItem(
              'joysticked_session_user',
              JSON.stringify({
                ...parsed,
                username: finalUsername,
                displayName: finalDisplayName,
                onboardingCompleted: true,
                preferences: payload.preferences
              })
            );
          } catch {}
        }
      }

      await refetch();
      toast.success('Perfil configurado com sucesso! Bem-vindo ao Joysticked.');
      if (onClose) {
        onClose();
      } else {
        router.push(`/${finalUsername}`);
      }
    } catch {
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 4;
  const dir = directionRef.current;

  const content = (
    <div className="relative flex min-h-full w-full flex-col font-geist-sans text-foreground overflow-hidden">
      {/* Animated ambient background per step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: STEP_GRADIENTS[currentStep - 1] }}
        />
      </AnimatePresence>

      {/* Top Header with Progress Indicators */}
      <header className="relative flex h-16 w-full items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => goToStep(currentStep - 1)}
              className="flex size-8 items-center justify-center rounded-xl border border-input bg-card/60 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground active:scale-[0.97]"
              title="Voltar"
            >
              <ArrowLeft className="size-3.5" />
            </button>
          )}
          <Logos.Joysticked className="h-5 opacity-90" />
        </div>

        {/* Animated spring segment progress */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <motion.div
                key={stepNum}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={cn(
                  'h-1 rounded-full',
                  isCurrent
                    ? 'w-8 bg-foreground'
                    : isCompleted
                      ? 'w-5 bg-foreground/60'
                      : 'w-5 bg-input/40'
                )}
              />
            );
          })}
        </div>

        <div className="font-medium text-muted-foreground text-xs">
          {currentStep} / {totalSteps}
        </div>
      </header>

      {/* Main Step Container */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-6">
        <AnimatePresence mode="wait" custom={dir}>
          {/* ── STEP 1: Name & Handle ── */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-md flex-col items-center gap-6 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-1.5">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Diga-nos seu nome para começar
                </h1>
                <p className="text-muted-foreground text-xs">
                  Escolha como você será identificado pelos outros jogadores.
                </p>
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full space-y-3.5 text-left">
                <div className="space-y-1">
                  <label
                    htmlFor="displayName"
                    className="font-medium text-muted-foreground text-xs"
                  >
                    Nome de exibição
                  </label>
                  <Input
                    id="displayName"
                    placeholder="Ex: Henrique"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 rounded-xl border-border bg-card px-3.5 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="username" className="font-medium text-muted-foreground text-xs">
                    Nome de usuário (@handle)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 select-none text-muted-foreground text-xs">
                      @
                    </span>
                    <Input
                      id="username"
                      placeholder="henrique"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                      }
                      className="h-11 rounded-xl border-border bg-card pl-7 text-sm"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full">
                <Button
                  size="lg"
                  disabled={!username.trim() || username.length < 3}
                  onClick={() => goToStep(2)}
                  className="h-11 w-full rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
                >
                  Continuar
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 2: Platforms ── */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full flex-col items-center gap-6 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-1.5">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Onde você joga?
                </h1>
                <p className="text-muted-foreground text-xs">
                  Selecione todas as plataformas em que você joga regularmente.
                </p>
              </motion.div>

              <motion.div
                custom={dir}
                variants={itemVariants}
                className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3"
              >
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        'relative flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.97]',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-lg ring-1 ring-primary/30'
                          : 'border-border bg-card/80 hover:border-input hover:bg-card'
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
                          {platform.badge}
                        </span>
                        <div
                          className={cn(
                            'flex size-4 items-center justify-center rounded-full border transition-all',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border'
                          )}
                        >
                          {isSelected && <Check className="size-2.5" />}
                        </div>
                      </div>

                      <div className="mt-4 space-y-0.5">
                        <h3 className="font-medium text-foreground text-xs">{platform.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{platform.description}</p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full max-w-sm">
                <Button
                  size="lg"
                  onClick={() => goToStep(3)}
                  className="h-11 w-full rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
                >
                  Continuar
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 3: Favorite Genres ── */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-lg flex-col items-center gap-6 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-1.5">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Seus gêneros favoritos
                </h1>
                <p className="text-muted-foreground text-xs">
                  Selecione ao menos um gênero para personalizar o seu catálogo.
                </p>
              </motion.div>

              <motion.div
                custom={dir}
                variants={itemVariants}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);

                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 font-medium text-xs transition-all duration-100 active:scale-[0.96]',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-card text-muted-foreground hover:border-input hover:text-foreground'
                      )}
                    >
                      {genre}
                    </button>
                  );
                })}
              </motion.div>

              <motion.div custom={dir} variants={itemVariants} className="w-full max-w-sm">
                <Button
                  size="lg"
                  disabled={selectedGenres.length === 0}
                  onClick={() => goToStep(4)}
                  className="h-11 w-full rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
                >
                  Continuar ({selectedGenres.length} selecionado{selectedGenres.length > 1 ? 's' : ''}
                  )
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ── STEP 4: Tinder-Style Game Discovery Swipe Deck ── */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              custom={dir}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full max-w-md flex-col items-center gap-5 text-center"
            >
              <motion.div custom={dir} variants={itemVariants} className="space-y-1">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Descubra títulos
                </h1>
                <p className="text-muted-foreground text-xs">
                  Arraste os cards para calibrar suas preferências iniciais.
                </p>
              </motion.div>

              {/* Tinder-Style Gesture Deck */}
              <motion.div custom={dir} variants={itemVariants} className="w-full">
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

              {/* Finish Button Option */}
              <motion.div custom={dir} variants={itemVariants} className="w-full">
                <Button
                  size="lg"
                  disabled={isSubmitting}
                  onClick={() => handleFinish()}
                  className="h-11 w-full rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                      Finalizando perfil…
                    </>
                  ) : (
                    'Concluir Onboarding e ir para o Perfil'
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
        <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl border border-border/80 bg-background/95 p-2 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      {content}
    </div>
  );
}
