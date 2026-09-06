'use client';

import { useForm } from '@tanstack/react-form';
import {
  ArrowLeft,
  Camera,
  Check,
  Gamepad2,
  ImageIcon,
  Loader2,
  MessageSquare,
  Save,
  Twitch,
  Twitter,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { FieldInfo } from '@/components/forms/field-info';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type SocialField = {
  key: 'twitter' | 'twitch' | 'discord' | 'steam' | 'instagram';
  label: string;
  icon: typeof Twitter;
  placeholder: string;
  prefix: string;
};

const SOCIAL_FIELDS: SocialField[] = [
  {
    key: 'twitter',
    label: 'Twitter / X',
    icon: Twitter,
    placeholder: 'usuario',
    prefix: 'x.com/'
  },
  {
    key: 'twitch',
    label: 'Twitch',
    icon: Twitch,
    placeholder: 'usuario',
    prefix: 'twitch.tv/'
  },
  {
    key: 'discord',
    label: 'Discord',
    icon: MessageSquare,
    placeholder: 'usuario',
    prefix: 'discord/'
  },
  {
    key: 'steam',
    label: 'Steam',
    icon: Gamepad2,
    placeholder: 'customURL',
    prefix: 'steam/'
  }
];

const PLATFORMS = [
  { id: 'pc', name: 'PC / Steam' },
  { id: 'playstation', name: 'PlayStation 5' },
  { id: 'xbox', name: 'Xbox Series X|S' },
  { id: 'switch', name: 'Nintendo Switch' },
  { id: 'handheld', name: 'Handheld & Retro' }
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

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated, refetch } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      displayName: '',
      avatarUrl: '',
      bannerUrl: '',
      bio: '',
      socials: {
        twitter: '',
        twitch: '',
        discord: '',
        steam: '',
        instagram: ''
      }
    },
    onSubmit: async ({ value }) => {
      const payload = {
        username: value.username,
        displayName: value.displayName || null,
        avatarUrl: value.avatarUrl || null,
        bannerUrl: value.bannerUrl || null,
        bio: value.bio || null,
        socials: {
          twitter: value.socials.twitter || null,
          twitch: value.socials.twitch || null,
          discord: value.socials.discord || null,
          steam: value.socials.steam || null,
          instagram: value.socials.instagram || null
        },
        preferences: {
          platforms: selectedPlatforms,
          genres: selectedGenres,
          likedGames: user?.preferences?.likedGames || []
        },
        onboardingCompleted: true
      };

      try {
        const userId = user?.id;
        if (!userId) {
          toast.error('Você precisa estar autenticado.');
          router.push('/auth');
          return;
        }

        const { error } = await api.profile({ id: userId }).put(payload);
        if (error) {
          const msg =
            typeof error.value === 'object' && error.value && 'message' in error.value
              ? String((error.value as { message?: string }).message)
              : 'Falha ao salvar o perfil.';
          toast.error(msg);
          return;
        }
        await refetch();
        setSaved(true);
        toast.success('Perfil atualizado com sucesso!');
        router.push(`/${payload.username}`);
      } catch {
        toast.error('Erro ao conectar ao servidor.');
      }
    }
  });

  // Redirect to /auth if user is not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Load existing profile from session user or API
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const hasTempUsername = user.username?.startsWith('user_');
        setIsNewProfile(hasTempUsername);

        form.setFieldValue('username', hasTempUsername ? '' : (user.username ?? ''));
        form.setFieldValue('displayName', user.displayName ?? '');
        form.setFieldValue('avatarUrl', user.avatarUrl ?? '');
        form.setFieldValue('bannerUrl', user.bannerUrl ?? '');
        form.setFieldValue('bio', user.bio ?? '');
        form.setFieldValue('socials.twitter', user.socials?.twitter ?? '');
        form.setFieldValue('socials.twitch', user.socials?.twitch ?? '');
        form.setFieldValue('socials.discord', user.socials?.discord ?? '');
        form.setFieldValue('socials.steam', user.socials?.steam ?? '');
        form.setFieldValue('socials.instagram', user.socials?.instagram ?? '');

        if (user.preferences?.platforms) {
          setSelectedPlatforms(user.preferences.platforms);
        }
        if (user.preferences?.genres) {
          setSelectedGenres(user.preferences.genres);
        }
      } catch (err) {
        console.warn('Profile load error:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    if (user) {
      loadProfile();
    } else if (!isAuthLoading) {
      setIsLoadingProfile(false);
    }
  }, [user, isAuthLoading, form]);

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

  if (isAuthLoading || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="size-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  const currentUsername = form.getFieldValue('username') || user?.username || 'profile';

  return (
    <div className="relative min-h-screen bg-black font-geist-sans text-neutral-100 selection:bg-neutral-100 selection:text-black">
      {/* ── Liquid-Glass Floating Top Bar ── */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <header className="pointer-events-auto flex h-12 w-full max-w-4xl items-center justify-between rounded-full border border-white/10 bg-neutral-950/60 px-4 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              className="size-8 rounded-full text-neutral-400 hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
            >
              <Link href={`/${currentUsername}`} title="Voltar ao perfil">
                <ArrowLeft className="size-4" strokeWidth={1.5} />
              </Link>
            </Button>
            <span className="font-semibold text-xs text-white">
              {isNewProfile ? 'Criar Perfil' : 'Editar Perfil'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => form.handleSubmit()}
              className="h-7.5 rounded-full px-4 text-xs font-medium transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              {saved ? (
                <>
                  <Check className="mr-1.5 size-3.5" strokeWidth={2} />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="mr-1.5 size-3.5" strokeWidth={1.5} />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </header>
      </div>

      {/* ── Banner Area ── */}
      <div className="relative h-60 w-full overflow-hidden bg-neutral-950 md:h-72">
        <form.Field name="bannerUrl">
          {(field) => (
            <>
              {field.state.value ? (
                <img
                  src={field.state.value}
                  alt="Banner do perfil"
                  className="h-full w-full object-cover opacity-80 outline outline-1 -outline-offset-1 outline-white/10"
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-neutral-900/40 via-neutral-950/70 to-black">
                  <div className="absolute -top-10 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
                  <div className="flex flex-col items-center gap-2 text-neutral-500">
                    <ImageIcon className="size-6 opacity-40" strokeWidth={1.5} />
                    <span className="text-xs opacity-50">Nenhum banner personalizado</span>
                  </div>
                </div>
              )}

              {/* Bottom gradient fade */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />

              {/* Change banner floating button */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Cole a URL da imagem para o banner:');
                  if (url) field.handleChange(url);
                }}
                className="absolute right-6 bottom-6 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-all duration-150 ease-out hover:bg-black/80 active:scale-[0.96]"
              >
                <Camera className="size-3.5" strokeWidth={1.5} />
                <span>Alterar banner</span>
              </button>
            </>
          )}
        </form.Field>
      </div>

      {/* ── Main Form Content ── */}
      <div className="mx-auto max-w-3xl px-4 pb-28 md:px-8">
        {/* Avatar + Title Row */}
        <div className="relative -mt-16 md:-mt-20 mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          <form.Field name="avatarUrl">
            {(field) => (
              <div className="relative shrink-0">
                <div className="size-28 overflow-hidden rounded-full border-2 border-white/10 bg-neutral-900 p-1 shadow-2xl md:size-32">
                  {field.state.value ? (
                    <img
                      src={field.state.value}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover outline outline-1 -outline-offset-1 outline-white/10"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-neutral-900 via-indigo-950 to-neutral-800 font-bold text-2xl text-white">
                      <User className="size-8 opacity-40" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Cole a URL da imagem para o seu avatar:');
                    if (url) field.handleChange(url);
                  }}
                  className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border border-white/15 bg-neutral-900 text-white shadow-lg transition-transform duration-150 ease-out hover:bg-neutral-800 active:scale-[0.96]"
                  title="Alterar avatar"
                >
                  <Camera className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </form.Field>

          <div className="mb-2 space-y-0.5">
            <h1 className="font-bold text-xl text-white tracking-tight md:text-2xl">
              {isNewProfile ? 'Configure seu Perfil' : 'Personalizar Perfil'}
            </h1>
            <p className="text-neutral-400 text-xs">
              Atualize suas informações, redes sociais e preferências de jogos.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          {/* ── 1. IDENTIDADE ── */}
          <section className="space-y-3">
            <h2 className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
              Identidade
            </h2>

            <div className="space-y-4 rounded-3xl bg-neutral-950/40 p-6 backdrop-blur-xl">
              {/* Display Name */}
              <form.Field name="displayName">
                {(field) => (
                  <div className="space-y-1.5">
                    <label htmlFor="displayName" className="font-medium text-xs text-neutral-300">
                      Nome de exibição
                    </label>
                    <Input
                      id="displayName"
                      placeholder="Ex: Henrique"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-10 rounded-xl border-white/[0.06] bg-white/[0.02] text-sm text-white placeholder:text-neutral-600 focus-visible:border-white/20 focus-visible:ring-0"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>

              {/* Username */}
              <form.Field
                name="username"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Nome de usuário obrigatório';
                    if (value.length < 3) return 'Mínimo de 3 caracteres';
                    if (value.length > 32) return 'Máximo de 32 caracteres';
                    if (!/^[a-zA-Z0-9_-]+$/.test(value))
                      return 'Apenas letras, números, _ e - permitidos';
                  }
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <label htmlFor="username" className="font-medium text-xs text-neutral-300">
                      Nome de usuário (@handle)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 select-none font-medium text-neutral-500 text-xs">
                        @
                      </span>
                      <Input
                        id="username"
                        placeholder="henrique"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(
                            e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                          )
                        }
                        onBlur={field.handleBlur}
                        aria-invalid={
                          field.state.meta.isTouched && field.state.meta.errors.length > 0
                        }
                        className="h-10 rounded-xl border-white/[0.06] bg-white/[0.02] pl-8 text-sm text-white placeholder:text-neutral-600 focus-visible:border-white/20 focus-visible:ring-0"
                      />
                    </div>
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>

              {/* Bio */}
              <form.Field
                name="bio"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value.length > 500) return 'Máximo de 500 caracteres';
                  }
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="bio" className="font-medium text-xs text-neutral-300">
                        Bio
                      </label>
                      <span className="text-[11px] text-neutral-500 tabular-nums">
                        {field.state.value?.length || 0}/500
                      </span>
                    </div>
                    <textarea
                      id="bio"
                      rows={3}
                      placeholder="Conte um pouco sobre suas preferências gamer..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={cn(
                        'w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-white shadow-xs outline-none placeholder:text-neutral-600',
                        'focus:border-white/20 focus:ring-0'
                      )}
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>
            </div>
          </section>

          {/* ── 2. PLATAFORMAS & GÊNEROS ── */}
          <section className="space-y-3">
            <h2 className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
              Preferências Gamer
            </h2>

            <div className="space-y-5 rounded-3xl bg-neutral-950/40 p-6 backdrop-blur-xl">
              {/* Platforms */}
              <div className="space-y-2">
                <span className="block font-medium text-xs text-neutral-300">
                  Plataformas que você joga
                </span>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);

                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        className={cn(
                          'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ease-out active:scale-[0.96]',
                          isSelected
                            ? 'bg-white text-black shadow-md'
                            : 'border border-white/[0.05] bg-white/[0.02] text-neutral-400 hover:border-white/10 hover:text-white'
                        )}
                      >
                        {platform.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-2">
                <span className="block font-medium text-xs text-neutral-300">
                  Gêneros favoritos
                </span>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);

                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 ease-out active:scale-[0.96]',
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-md'
                            : 'border border-white/[0.03] bg-white/[0.015] text-neutral-400 hover:border-white/[0.08] hover:text-white'
                        )}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. REDES SOCIAIS ── */}
          <section className="space-y-3">
            <h2 className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
              Conexões & Redes
            </h2>

            <div className="space-y-3.5 rounded-3xl bg-neutral-950/40 p-6 backdrop-blur-xl">
              {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder, prefix }) => (
                <form.Field key={key} name={`socials.${key}`}>
                  {(field) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`social-${key}`}
                        className="flex items-center gap-1.5 font-medium text-xs text-neutral-300"
                      >
                        <Icon className="size-3.5 text-neutral-400" strokeWidth={1.5} />
                        {label}
                      </label>
                      <div className="flex items-center rounded-xl border border-white/[0.06] bg-white/[0.02] focus-within:border-white/20">
                        <span className="select-none px-3 py-2 text-neutral-500 text-xs">
                          {prefix}
                        </span>
                        <input
                          id={`social-${key}`}
                          type="text"
                          placeholder={placeholder}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="h-10 flex-1 bg-transparent pr-3 text-sm text-white outline-none placeholder:text-neutral-600"
                        />
                      </div>
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              ))}
            </div>
          </section>

          {/* Bottom Save Action Button */}
          <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
            {([isSubmitting, canSubmit]) => (
              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit || isSubmitting}
                className="h-12 w-full rounded-full text-xs font-medium transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                    Salvando perfil…
                  </>
                ) : saved ? (
                  <>
                    <Check className="mr-1.5 size-4" strokeWidth={2} />
                    Perfil Atualizado!
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 size-4" strokeWidth={1.5} />
                    {isNewProfile ? 'Criar Perfil' : 'Salvar Alterações'}
                  </>
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
