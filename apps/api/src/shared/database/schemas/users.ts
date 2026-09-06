import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  // Auth & Onboarding fields
  email: text('email').unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  // Profile fields
  avatarUrl: varchar('avatar_url'),
  bannerUrl: varchar('banner_url'),
  bio: text('bio'),
  socials: jsonb('socials').$type<{
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
    steam?: string | null;
    instagram?: string | null;
  } | null>(),
  preferences: jsonb('preferences').$type<{
    platforms?: string[];
    genres?: string[];
    likedGames?: string[];
  } | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
