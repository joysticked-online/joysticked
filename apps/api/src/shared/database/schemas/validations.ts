import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const validationTypeEnum = pgEnum('validation_type', ['email']);

export const validations = pgTable('validation', {
  id: uuid('id').primaryKey().defaultRandom(),

  identifier: text('identifier').notNull(),
  type: validationTypeEnum('type').notNull(),

  code: text('code').notNull(),

  expiresAt: timestamp('expires_at').default(sql`now() + interval '2 hours'`).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  usedAt: timestamp('used_at')
});

export type Validation = typeof validations.$inferSelect;
