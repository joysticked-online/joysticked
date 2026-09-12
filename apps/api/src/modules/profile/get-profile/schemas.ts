import z from 'zod';
import { zDate } from '../../../shared/schemas/zod-date';

export const profileSocialsSchema = z.object({
  twitter: z.string().nullable().optional(),
  twitch: z.string().nullable().optional(),
  discord: z.string().nullable().optional(),
  steam: z.string().nullable().optional(),
  steamId: z.string().nullable().optional(),
  steamPublic: z.boolean().nullable().optional(),
  instagram: z.string().nullable().optional()
});

export const profilePreferencesSchema = z.object({
  platforms: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  likedGames: z.array(z.string()).optional()
});

export const profileResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
  avatarUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  bio: z.string().nullable(),
  socials: profileSocialsSchema.nullable(),
  preferences: profilePreferencesSchema.nullable().optional(),
  createdAt: zDate
});

export function toPublicProfile<
  T extends { email?: unknown; emailVerified?: unknown; socials?: any }
>(profile: T) {
  const { email: _email, emailVerified: _emailVerified, socials, ...publicProfile } = profile;
  const publicSocials =
    socials?.steamPublic === false ? { ...socials, steam: null, steamId: null } : socials;

  return { ...publicProfile, socials: publicSocials };
}
