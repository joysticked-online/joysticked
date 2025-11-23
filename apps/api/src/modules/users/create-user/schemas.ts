import { z } from 'zod';

export const createUserBodySchema = z.object({
  username: z.string().min(3),
  bannerUrl: z.url(),
  avatarUrl: z.url(),
  pronouns: z.enum(['he/him', 'she/her', 'they/them', 'he/her', 'she/him', 'any']),
  isPrivate: z.boolean(),
  location: z.string(),
  bio: z.string(),
  socials: z.object({
    twitter: z.url(),
    github: z.url(),
    instragram: z.url(),
    steam: z.url(),
    youtube: z.url(),
    twitch: z.url(),
    discord: z.string()
  }),
  emailValidationRequestId: z.uuid()
});

export type CreateUser = z.infer<typeof createUserBodySchema>;
