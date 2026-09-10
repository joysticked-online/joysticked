'use client';

import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  const content = (
    <div className="relative flex min-h-full w-full flex-col font-geist-sans text-foreground">
      {/* Top Header with Progress Bars */}
      <header className="relative flex h-16 w-full items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="flex size-8 items-center justify-center rounded-xl border border-input bg-card/60 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground active:scale-[0.97]"
              title="Voltar"
            >
              <ArrowLeft className="size-3.5" />
            </button>
          )}
          <Logos.Joysticked className="h-5 opacity-90" />
        </div>

        {/* Step Indicator Segments */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
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
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Name & Handle ── */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex w-full max-w-md flex-col items-center gap-6 text-center"
            >
              <div className="space-y-1.5">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Diga-nos seu nome para começar
                </h1>
                <p className="text-muted-foreground text-xs">
                  Escolha como você será identificado pelos outros jogadores.
                </p>
              </div>

              <div className="w-full space-y-3.5 text-left">
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
              </div>

              <Button
                size="lg"
                disabled={!username.trim() || username.length < 3}
                onClick={() => setCurrentStep(2)}
                className="h-11 w-full rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* ── STEP 2: Platforms ── */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex w-full flex-col items-center gap-6 text-center"
            >
              <div className="space-y-1.5">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Onde você joga?
                </h1>
                <p className="text-muted-foreground text-xs">
                  Selecione todas as plataformas em que você joga regularmente.
                </p>
              </div>

              <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={cn(
                        'relative flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.97]',
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
              </div>

              <Button
                size="lg"
                onClick={() => setCurrentStep(3)}
                className="h-11 w-full max-w-sm rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* ── STEP 3: Favorite Genres ── */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex w-full max-w-lg flex-col items-center gap-6 text-center"
            >
              <div className="space-y-1.5">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Seus gêneros favoritos
                </h1>
                <p className="text-muted-foreground text-xs">
                  Selecione ao menos um gênero para personalizar o seu catálogo.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);

                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 font-medium text-xs transition-all duration-150 active:scale-[0.96]',
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-card text-muted-foreground hover:border-input hover:text-foreground'
                      )}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>

              <Button
                size="lg"
                disabled={selectedGenres.length === 0}
                onClick={() => setCurrentStep(4)}
                className="h-11 w-full max-w-sm rounded-xl font-medium text-xs transition-all active:scale-[0.97]"
              >
                Continuar ({selectedGenres.length} selecionado{selectedGenres.length > 1 ? 's' : ''}
                )
              </Button>
            </motion.div>
          )}

          {/* ── STEP 4: Tinder-Style Game Discovery Swipe Deck ── */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex w-full max-w-md flex-col items-center gap-5 text-center"
            >
              <div className="space-y-1">
                <h1 className="font-bold font-redaction text-2xl tracking-tight md:text-3xl">
                  Descubra títulos
                </h1>
                <p className="text-muted-foreground text-xs">
                  Arraste os cards para calibrar suas preferências iniciais.
                </p>
              </div>

              {/* Tinder-Style Gesture Deck */}
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

              {/* Finish Button Option */}
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
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[150px]" />
      {content}
    </div>
  );
}
