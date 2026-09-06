import z from 'zod';
import { profileResponseSchema, profileSocialsSchema } from '../get-profile/schemas';

export const createProfileBodySchema = z.object({
  username: z.string().min(3).max(32),
  avatarUrl: z.url().nullable().optional(),
  bannerUrl: z.url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  socials: profileSocialsSchema.nullable().optional()
});

export const createProfileResponseSchema = profileResponseSchema;
