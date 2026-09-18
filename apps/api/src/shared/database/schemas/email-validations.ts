import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const emailValidations = pgTable(
  'email_validations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    identifier: text('identifier').notNull(),
    otpHash: text('otp_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(5),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').notNull().defaultNow()
  },
  (table) => [
    index('email_validations_identifier_created_at_idx').on(table.identifier, table.createdAt)
  ]
);

export type EmailValidation = typeof emailValidations.$inferSelect;
