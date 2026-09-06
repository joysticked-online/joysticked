import { doublePrecision, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const gameReviews = pgTable('game_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  gameId: text('game_id').notNull(),
  gameSlug: text('game_slug').notNull(),
  gameTitle: text('game_title').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  rating: doublePrecision('rating').notNull(), // 1.0 to 5.0
  reviewText: text('review_text'),
  platform: text('platform'),
  hoursPlayed: text('hours_played'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
