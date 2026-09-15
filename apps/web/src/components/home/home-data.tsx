import { Gamepad2, Monitor, Smartphone } from 'lucide-react';
import { PixelHeart } from '@/components/landing/pixel-heart';
import type { Game } from '@/lib/games';

export const FALLBACK_POPULAR_GAMES: Game[] = [
  {
    id: 3001,
    name: 'EA SPORTS FC 24',
    slug: 'ea-sports-fc-24',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6q78.webp',
    rating: 3.8
  },
  {
    id: 119133,
    name: 'Elden Ring',
    slug: 'elden-ring',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.webp',
    rating: 4.8
  },
  {
    id: 1877,
    name: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co825v.webp',
    rating: 4.3
  }
];

export const FALLBACK_TOP_RATED_GAMES: Game[] = [
  {
    id: 1020,
    name: "Baldur's Gate 3",
    slug: 'baldurs-gate-3',
    summary:
      'Reúna seu grupo e retorne aos Reinos Esquecidos em um conto de companheirismo e traição, sacrifício e sobrevivência.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.webp',
    rating: 4.9
  },
  {
    id: 1942,
    name: 'The Witcher 3: Wild Hunt',
    slug: 'the-witcher-3-wild-hunt',
    summary:
      'Torne-se um caçador de monstros profissional em busca da criança da profecia em um vasto mundo aberto.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp',
    rating: 4.9
  },
  {
    id: 1192,
    name: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    summary:
      'A história do fora da lei Arthur Morgan e da notória gangue Van der Linde no fim da era do Velho Oeste.',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp',
    rating: 4.9
  }
];

export const FALLBACK_UPCOMING_GAMES: Game[] = [
  {
    id: 3219630,
    name: 'Halloween: The Game',
    slug: 'halloween-the-game',
    coverUrl:
      'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/3219630/library_600x900.jpg',
    releaseYear: 'Em breve',
    isSteamAwaited: true
  },
  {
    id: 1867240,
    name: 'WARDOGS',
    slug: 'wardogs',
    coverUrl:
      'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1867240/library_600x900.jpg',
    releaseYear: 'Em breve',
    isSteamAwaited: true
  },
  {
    id: 119171,
    name: 'Grand Theft Auto VI',
    slug: 'grand-theft-auto-vi',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7v2e.webp',
    releaseYear: '2025',
    isSteamAwaited: true
  }
];

export const PERIOD_TABS = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Essa semana' },
  { id: 'month', label: 'Esse mês' },
  { id: 'all', label: 'Todos os tempos' }
] as const;

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

export function getPlatformIcon(platform?: string | null) {
  if (!platform) return null;
  const lower = platform.toLowerCase();
  if (
    lower.includes('pc') ||
    lower.includes('windows') ||
    lower.includes('mac') ||
    lower.includes('linux') ||
    lower.includes('steam')
  ) {
    return <Monitor className="size-3.5 text-neutral-400" />;
  }
  if (lower.includes('mobile') || lower.includes('android') || lower.includes('ios')) {
    return <Smartphone className="size-3.5 text-neutral-400" />;
  }
  return <Gamepad2 className="size-3.5 text-neutral-400" />;
}

export function RatingHearts({ rating, size = 14 }: { rating: number; size?: number }) {
  const normalized = rating > 5 ? rating / 2 : rating;
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        const heartNum = i + 1;
        const isFull = normalized >= heartNum;
        const isHalf = !isFull && normalized >= heartNum - 0.5;
        const variant = isFull ? 'full' : isHalf ? 'half' : 'empty';
        return (
          <PixelHeart key={i} size={size} variant={variant} color="#FFFFFF" emptyColor="#333333" />
        );
      })}
    </div>
  );
}
