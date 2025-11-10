import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const waitlists = pgTable('waitlists', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});
