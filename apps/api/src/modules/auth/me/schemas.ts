import z from 'zod';
import { zDate } from '../../../shared/schemas/zod-date';

export const meResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  displayName: z.string().nullable().optional(),
  email: z.string().nullable(),
  emailVerified: z.boolean(),
  onboardingCompleted: z.boolean(),
  avatarUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  bio: z.string().nullable(),
  socials: z
    .object({
      twitter: z.string().nullable().optional(),
      twitch: z.string().nullable().optional(),
      discord: z.string().nullable().optional(),
      steam: z.string().nullable().optional(),
      steamId: z.string().nullable().optional(),
      steamPublic: z.boolean().nullable().optional(),
      instagram: z.string().nullable().optional()
    })
    .nullable(),
  preferences: z
    .object({
      platforms: z.array(z.string()).optional(),
      genres: z.array(z.string()).optional(),
      likedGames: z.array(z.string()).optional()
    })
    .nullable()
    .optional(),
  createdAt: zDate
});
