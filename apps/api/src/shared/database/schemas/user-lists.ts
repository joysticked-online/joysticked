import { boolean, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userLists = pgTable(
  'user_lists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').notNull().default(true),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    likesCount: integer('likes_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => [uniqueIndex('user_lists_owner_slug_unique').on(table.ownerId, table.slug)]
);

export const userListGames = pgTable(
  'user_list_games',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listId: uuid('list_id').notNull().references(() => userLists.id, { onDelete: 'cascade' }),
    gameId: text('game_id').notNull(),
    gameSlug: text('game_slug').notNull(),
    game: jsonb('game').$type<Record<string, unknown>>().notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [uniqueIndex('user_list_games_list_game_unique').on(table.listId, table.gameId)]
);

export const userListLikes = pgTable(
  'user_list_likes',
  {
    listId: uuid('list_id').notNull().references(() => userLists.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [uniqueIndex('user_list_likes_unique').on(table.listId, table.userId)]
);
