/* biome-ignore-all lint/performance/noImgElement: these dynamic external images require native rendering. */

'use client';

import { useForm } from '@tanstack/react-form';
import {
  ArrowLeft,
  Camera,
  Check,
  ImageIcon,
  Instagram,
  Loader2,
  MessageSquare,
  Save,
  Twitch,
  Twitter,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { FieldInfo } from '@/components/forms/field-info';
import { SteamConnectionCard } from '@/components/profile/steam-connection-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type SocialField = {
  key: 'twitter' | 'twitch' | 'discord' | 'instagram';
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
    key: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'usuario',
    prefix: 'instagram.com/'
  }
];

const PLATFORMS = [
  { id: 'pc', name: 'PC / Steam' },
  { id: 'playstation', name: 'PlayStation 5' },
  { id: 'xbox', name: 'Xbox Series X|S' },
  { id: 'switch', name: 'Nintendo Switch' },
  { id: 'handheld', name: 'Portáteis & Retro' }
];

const GENRES = [
  'RPG',
  'Ação',
  'Souls-like',
  'FPS / Shooter',
  'Indie',
  'Terror',
  'Roguelike',
  'Mundo Aberto',
  'Estratégia',
  'Plataforma',
  'Cyberpunk',
  'Luta',
  'Corrida',
  'MMO',
  'Metroidvania',
  'Narrativo'
];

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated, refetch } = useAuth();
  const [saved, setSaved] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [steamData, setSteamData] = useState<{
    steam?: string | null;
    steamId?: string | null;
    steamPublic?: boolean | null;
  }>({
    steam: null,
    steamId: null,
    steamPublic: true
  });

  // Check for ?steam=connected in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('steam') === 'connected') {
        toast.success('Conta Steam vinculada com sucesso!');
        const url = new URL(window.location.href);
        url.searchParams.delete('steam');
        window.history.replaceState({}, '', url.toString());
      } else if (params.get('steam') === 'error') {
        toast.error('Falha ao autenticar com a Steam.');
        const url = new URL(window.location.href);
        url.searchParams.delete('steam');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

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
        instagram: ''
      }
    },
    onSubmit: async ({ value }) => {
      const payload = {
        username: value.username.toLowerCase().trim(),
        displayName: value.displayName?.trim() || null,
        avatarUrl: value.avatarUrl || null,
        bannerUrl: value.bannerUrl || null,
        bio: value.bio?.trim() || null,
        socials: {
          twitter: value.socials.twitter || null,
          twitch: value.socials.twitch || null,
          discord: value.socials.discord || null,
          steam: steamData.steam || null,
          steamId: steamData.steamId || null,
          steamPublic: steamData.steamPublic ?? true,
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

        // 1. Update local storage directly for instant responsiveness
        if (typeof window !== 'undefined') {
          const currentLocal = localStorage.getItem('joysticked_session_user');
          const parsed = currentLocal ? JSON.parse(currentLocal) : {};
          localStorage.setItem(
            'joysticked_session_user',
            JSON.stringify({ ...parsed, ...payload })
          );
        }

        // 2. Persist to API
        const token =
          typeof window !== 'undefined' ? localStorage.getItem('joysticked_session_token') : null;

        const { error } = await api.profile({ id: userId }).put(payload, {
          fetch: {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        });
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
        toast.error('Erro ao salvar no servidor.');
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
        form.setFieldValue('socials.instagram', user.socials?.instagram ?? '');

        setSteamData({
          steam: user.socials?.steam ?? null,
          steamId: (user.socials as any)?.steamId ?? null,
          steamPublic: (user.socials as any)?.steamPublic ?? true
        });

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
      <div className="flex min-h-screen items-center justify-center bg-[#08080a]">
        <Loader2 className="size-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  const currentUsername = form.getFieldValue('username') || user?.username || 'profile';

  return (
    <div className="relative min-h-screen bg-[#08080a] font-geist-sans text-white selection:bg-white selection:text-black">
      {/* Subtle Retro Dot Matrix Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] opacity-70 [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_60%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Floating Top Bar with Concentric Radii and Hairline Rim */}
      <div className="pointer-events-none fixed top-4 right-0 left-0 z-50 flex justify-center px-4">
        <header className="pointer-events-auto flex h-12 w-full max-w-4xl items-center justify-between rounded-full bg-[#111114]/90 px-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="size-8 rounded-full text-zinc-400 hover:bg-white/[0.06] hover:text-white active:scale-[0.96]"
            >
              <Link href={`/${currentUsername}`} title="Voltar ao perfil">
                <ArrowLeft className="size-4" strokeWidth={1.5} />
              </Link>
            </Button>
            <span className="font-medium font-redaction text-sm text-white tracking-tight">
              {isNewProfile ? 'Criar Perfil' : 'Editar Perfil'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => form.handleSubmit()}
              className="h-8 rounded-full bg-white px-4 font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96]"
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

      {/* Banner Customization Area */}
      <div className="relative h-52 w-full overflow-hidden bg-[#0c0c0e] sm:h-60 md:h-72">
        <form.Field name="bannerUrl">
          {(field) => (
            <>
              {field.state.value ? (
                <img
                  src={field.state.value}
                  alt="Banner do perfil"
                  className="h-full w-full object-cover opacity-75"
                />
              ) : (
                <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-white/[0.03] to-transparent">
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <ImageIcon className="size-6 opacity-40" strokeWidth={1.5} />
                    <span className="font-mono text-[11px] text-zinc-500">
                      Sem banner personalizado
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom gradient vignette */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#08080a] via-[#08080a]/80 to-transparent" />

              {/* Change banner button */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt('Cole a URL da imagem para o banner:');
                  if (url) field.handleChange(url);
                }}
                className="absolute right-6 bottom-6 flex items-center gap-1.5 rounded-xl bg-black/70 px-3.5 py-1.5 font-medium text-white text-xs ring-1 ring-white/15 backdrop-blur-md transition-all hover:bg-black/90 active:scale-[0.96]"
              >
                <Camera className="size-3.5" strokeWidth={1.5} />
                <span>Alterar banner</span>
              </button>
            </>
          )}
        </form.Field>
      </div>

      {/* Main Form Content Container */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-28 md:px-8">
        {/* Avatar + Title Row */}
        <div className="-mt-14 sm:-mt-16 md:-mt-20 relative mb-8 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
          <form.Field name="avatarUrl">
            {(field) => (
              <div className="relative shrink-0">
                <div className="size-28 overflow-hidden rounded-full bg-zinc-900 p-0.5 shadow-2xl ring-2 ring-white/10 md:size-32">
                  {field.state.value ? (
                    <img
                      src={field.state.value}
                      alt="Avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 font-bold text-2xl text-white">
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
                  className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:bg-zinc-200 active:scale-[0.96]"
                  title="Alterar avatar"
                >
                  <Camera className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </form.Field>

          <div className="mb-2 space-y-0.5">
            <h1 className="font-medium font-redaction text-2xl text-white tracking-tight [text-wrap:balance] md:text-3xl">
              {isNewProfile ? 'Configure seu Perfil' : 'Personalizar Perfil'}
            </h1>
            <p className="text-xs text-zinc-400 [text-wrap:pretty]">
              Atualize suas informações públicas, redes sociais e preferências.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* ── 1. IDENTIDADE ── */}
          <section className="space-y-2.5">
            <h2 className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
              Identidade
            </h2>

            <div className="space-y-4 rounded-[24px] bg-[#111114]/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
              {/* Display Name */}
              <form.Field name="displayName">
                {(field) => (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="displayName"
                      className="block font-medium text-[11px] text-zinc-300"
                    >
                      Nome de exibição
                    </label>
                    <Input
                      id="displayName"
                      placeholder="Ex: Henrique"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="h-11 rounded-xl border-0 bg-white/[0.03] px-3.5 text-base text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 sm:text-xs"
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
                    <label
                      htmlFor="username"
                      className="block font-medium text-[11px] text-zinc-300"
                    >
                      Nome de usuário (@handle)
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3.5 select-none font-mono text-xs text-zinc-500">
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
                        className="h-11 rounded-xl border-0 bg-white/[0.03] pr-3.5 pl-8 text-base text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 sm:text-xs"
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
                      <label htmlFor="bio" className="block font-medium text-[11px] text-zinc-300">
                        Bio
                      </label>
                      <span className="font-mono text-[10px] text-zinc-500 tabular-nums">
                        {field.state.value?.length || 0}/500
                      </span>
                    </div>
                    <textarea
                      id="bio"
                      rows={3}
                      placeholder="Conte um pouco sobre suas preferências nos games..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className="w-full resize-none rounded-xl border-0 bg-white/[0.03] p-3.5 text-base text-white ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/30 sm:text-xs"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>
            </div>
          </section>

          {/* ── 2. PLATAFORMAS & GÊNEROS ── */}
          <section className="space-y-2.5">
            <h2 className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
              Preferências Gamer
            </h2>

            <div className="space-y-5 rounded-[24px] bg-[#111114]/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
              {/* Platforms */}
              <div className="space-y-2">
                <span className="block font-medium text-[11px] text-zinc-300">
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
                          'rounded-xl px-3.5 py-2 font-medium text-xs transition-all active:scale-[0.96]',
                          isSelected
                            ? 'bg-white text-black ring-0'
                            : 'bg-white/[0.03] text-zinc-400 ring-1 ring-white/[0.08] hover:bg-white/[0.06] hover:text-white'
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
                <span className="block font-medium text-[11px] text-zinc-300">
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
                          'rounded-full px-3.5 py-1.5 font-medium text-xs transition-all active:scale-[0.96]',
                          isSelected
                            ? 'bg-white text-black ring-0'
                            : 'bg-white/[0.03] text-zinc-400 ring-1 ring-white/[0.08] hover:bg-white/[0.06] hover:text-white'
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

          {/* ── 3. REDES SOCIAIS & STEAM ── */}
          <section className="space-y-2.5">
            <h2 className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
              Conexões &amp; Redes
            </h2>

            <div className="space-y-3.5 rounded-[24px] bg-[#111114]/90 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.08] backdrop-blur-2xl">
              {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder, prefix }) => (
                <form.Field key={key} name={`socials.${key}`}>
                  {(field) => (
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`social-${key}`}
                        className="flex items-center gap-1.5 font-medium text-[11px] text-zinc-300"
                      >
                        <Icon className="size-3.5 text-zinc-400" strokeWidth={1.5} />
                        <span>{label}</span>
                      </label>
                      <div className="flex items-center rounded-xl bg-white/[0.03] ring-1 ring-white/[0.08] focus-within:ring-1 focus-within:ring-white/30">
                        <span className="select-none px-3.5 py-2 font-mono text-xs text-zinc-500">
                          {prefix}
                        </span>
                        <input
                          id={`social-${key}`}
                          type="text"
                          placeholder={placeholder}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="h-11 flex-1 bg-transparent pr-3.5 text-base text-white outline-none placeholder:text-zinc-600 sm:text-xs"
                        />
                      </div>
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              ))}
            </div>

            {/* Steam Integration Card */}
            <div className="pt-1">
              <SteamConnectionCard
                steam={steamData.steam}
                steamId={steamData.steamId}
                steamPublic={steamData.steamPublic}
                onUpdate={(data) => {
                  setSteamData((prev) => ({
                    ...prev,
                    ...data
                  }));
                }}
              />
            </div>
          </section>

          {/* Bottom Save Action Button */}
          <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit]}>
            {([isSubmitting, canSubmit]) => (
              <Button
                type="submit"
                size="lg"
                disabled={!canSubmit || isSubmitting}
                className="h-12 w-full rounded-xl bg-white font-medium text-black text-xs transition-all hover:bg-zinc-200 active:scale-[0.96] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Salvando perfil…
                  </>
                ) : saved ? (
                  <>
                    <Check className="mr-2 size-4" strokeWidth={2} />
                    Perfil Atualizado!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" strokeWidth={1.5} />
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
