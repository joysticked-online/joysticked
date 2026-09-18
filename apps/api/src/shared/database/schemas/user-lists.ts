import { boolean, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';

export const userLists = pgTable(
  'user_lists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isPublic: boolean('is_public').notNull().default(true),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    games: jsonb('games').$type<unknown[]>().notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => [uniqueIndex('user_lists_owner_slug_unique').on(table.userId, table.slug)]
);

export const userListLikes = pgTable(
  'user_list_likes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    listId: uuid('list_id').notNull().references(() => userLists.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  (table) => [uniqueIndex('user_list_likes_unique').on(table.listId, table.userId)]
);
