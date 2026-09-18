export type DevUserSocials = {
  twitter?: string | null;
  twitch?: string | null;
  discord?: string | null;
  steam?: string | null;
  steamId?: string | null;
  steamPublic?: boolean | null;
  instagram?: string | null;
};

export type DevUserPreferences = {
  platforms?: string[];
  genres?: string[];
  likedGames?: string[];
};

export type DevUser = {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  socials: DevUserSocials | null;
  preferences: DevUserPreferences | null;
  createdAt: Date;
};

export const inMemoryDevUsers = new Map<string, DevUser>();
