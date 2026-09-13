import type { Metadata } from 'next';
import { PublicProfileView } from './public-profile-view';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Props = {
  params: Promise<{ username: string }>;
};

type Profile = {
  id: string;
  username: string;
  displayName?: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  socials: {
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
    steam?: string | null;
    instagram?: string | null;
  } | null;
  preferences?: {
    platforms?: string[];
    genres?: string[];
    likedGames?: string[];
  } | null;
  createdAt: string;
};

async function fetchProfile(username: string): Promise<Profile | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/profile/u/${username}`, {
      cache: 'no-store'
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch profile');

    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfile(username);

  const title = profile?.displayName || profile?.username || username;
  const desc = profile?.bio ?? `Confira o perfil de jogos de ${title} no Joysticked.`;

  return {
    title: `${title} — Joysticked`,
    description: desc,
    openGraph: {
      title: `${title} no Joysticked`,
      description: desc,
      images: profile?.avatarUrl ? [{ url: profile.avatarUrl }] : []
    }
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  let profile = await fetchProfile(username);

  if (!profile) {
    profile = {
      id: username,
      username,
      displayName: username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bannerUrl: null,
      bio: 'Jogador no Joysticked',
      socials: null,
      preferences: null,
      createdAt: new Date().toISOString()
    };
  }

  return <PublicProfileView profile={profile} />;
}
