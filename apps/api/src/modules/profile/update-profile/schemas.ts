import z from 'zod';
import {
  profilePreferencesSchema,
  profileResponseSchema,
  profileSocialsSchema
} from '../get-profile/schemas';

export const updateProfileBodySchema = z.object({
  username: z.string().min(3).max(32).optional(),
  displayName: z.string().max(64).nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
  avatarUrl: z.url().nullable().optional(),
  bannerUrl: z.url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  socials: profileSocialsSchema.nullable().optional(),
  preferences: profilePreferencesSchema.nullable().optional()
});

export const updateProfileResponseSchema = profileResponseSchema;
