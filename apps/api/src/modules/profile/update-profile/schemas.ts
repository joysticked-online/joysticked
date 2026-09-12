import z from 'zod';
import {
  profilePreferencesSchema,
  profileResponseSchema,
  profileSocialsSchema
} from '../get-profile/schemas';

const RESERVED_USERNAMES = new Set([
  'admin',
  'api',
  'auth',
  'home',
  'profile',
  'settings',
  'support'
]);
const usernameSchema = z
  .string()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9][a-z0-9_-]*$/, 'Use lowercase letters, numbers, hyphens, or underscores.')
  .refine((username) => !RESERVED_USERNAMES.has(username), 'This username is reserved.');

export const updateProfileBodySchema = z.object({
  username: usernameSchema.optional(),
  displayName: z.string().max(64).nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
  avatarUrl: z.url().nullable().optional(),
  bannerUrl: z.url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  socials: profileSocialsSchema.nullable().optional(),
  preferences: profilePreferencesSchema.nullable().optional()
});

export const updateProfileResponseSchema = profileResponseSchema;
