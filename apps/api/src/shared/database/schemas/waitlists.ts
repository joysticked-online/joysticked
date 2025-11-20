import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const waitlists = pgTable('waitlists', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull()
});
