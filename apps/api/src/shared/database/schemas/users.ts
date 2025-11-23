import { relations } from 'drizzle-orm';
import { pgEnum, jsonb, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { accounts } from './accounts';

export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  bannerUrl: text('banner_url'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  socials: jsonb('socials').$type<{
    twitter: string;
    github: string;
    instragram: string;
    steam: string;
    youtube: string;
    twitch: string;
    discord: string;
  }>(),
  username: text('handle').notNull().unique(),
  name: text('name'),
  email: text('email').notNull().unique(),
  pronouns: text('pronouns'),
  role: userRoleEnum('role').notNull().default('user'),
  isPrivate: boolean('is_private').notNull().default(false),
  location: text('location'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdateFn(() => new Date())
});

export type User = typeof users.$inferSelect;

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts)
}));
