import { uuid, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { relations } from 'drizzle-orm';

export const accounts = pgTable('account', {
  id: uuid('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => new Date())
    .notNull()
});

export type Account = typeof accounts.$inferSelect;

export const accountRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));
