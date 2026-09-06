import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const gameActivities = pgTable('game_activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: text('game_id').notNull(),
  gameSlug: text('game_slug').notNull(),
  gameTitle: text('game_title').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'played' | 'completed' | 'rated' | 'liked' | 'backlog'
  detail: text('detail'),
  platform: text('platform'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
