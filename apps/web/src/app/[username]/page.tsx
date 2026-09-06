import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicProfileView } from './public-profile-view';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/u/${username}`, {
      next: { revalidate: 60 }
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

  if (!profile) {
    return { title: 'Profile not found — Joysticked' };
  }

  return {
    title: `${profile.username} — Joysticked`,
    description: profile.bio ?? `Check out ${profile.username}'s gaming profile on Joysticked.`,
    openGraph: {
      title: `${profile.username} on Joysticked`,
      description: profile.bio ?? `Check out ${profile.username}'s gaming profile.`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : []
    }
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await fetchProfile(username);

  if (!profile) notFound();

  return <PublicProfileView profile={profile} />;
}
