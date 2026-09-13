import { index, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';

import { users } from './users';

export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    provider: text('provider').notNull(), // 'google' | 'discord'
    providerId: text('provider_id').notNull(), // provider's own user ID
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerId] }),
    index('oauth_accounts_user_id_idx').on(table.userId)
  ]
);
