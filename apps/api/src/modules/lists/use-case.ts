import { and, asc, desc, eq, or, sql } from 'drizzle-orm';
import type { Database } from '../../shared/database';
import { userListGames, userListLikes, userLists, users } from '../../shared/database/schemas';
import { executeTransaction } from '../../shared/database/transaction';
import { ConflictError } from '../../shared/errors/conflict-error';
import { ResourceNotFoundError } from '../../shared/errors/resource-not-found-error';

type GameSnapshot = Record<string, unknown>;

function toList(row: typeof userLists.$inferSelect, owner: typeof users.$inferSelect, games: GameSnapshot[]) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    ownerUsername: owner.username,
    ownerDisplayName: owner.displayName,
    ownerAvatarUrl: owner.avatarUrl,
    isPublic: row.isPublic,
    games,
    gameCount: games.length,
    likesCount: row.likesCount,
    tags: row.tags,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  };
}

async function getList(db: Database, listId: string) {
  const [row] = await db.select().from(userLists).where(eq(userLists.id, listId));
  if (!row) throw new ResourceNotFoundError('List not found');
  const [owner] = await db.select().from(users).where(eq(users.id, row.ownerId));
  if (!owner) throw new ResourceNotFoundError('List owner not found');
  const games = await db
    .select({ game: userListGames.game })
    .from(userListGames)
    .where(eq(userListGames.listId, row.id))
    .orderBy(asc(userListGames.position));
  return toList(row, owner, games.map(({ game }) => game));
}

export async function listLists(db: Database, username?: string, viewerId?: string) {
  const rows = await db
    .select({ list: userLists, owner: users })
    .from(userLists)
    .innerJoin(users, eq(users.id, userLists.ownerId))
    .where(username ? eq(users.username, username.trim().toLowerCase()) : undefined)
    .orderBy(desc(userLists.updatedAt));
  return Promise.all(
    rows
      .filter(({ list }) => list.isPublic || list.ownerId === viewerId)
      .map(({ list }) => getList(db, list.id))
  );
}

export async function findList(db: Database, username: string, slug: string, viewerId?: string) {
  const [row] = await db
    .select({ list: userLists, owner: users })
    .from(userLists)
    .innerJoin(users, eq(users.id, userLists.ownerId))
    .where(and(eq(users.username, username.trim().toLowerCase()), eq(userLists.slug, slug.trim().toLowerCase())));
  if (!row || (!row.list.isPublic && row.list.ownerId !== viewerId)) {
    throw new ResourceNotFoundError('List not found');
  }
  return getList(db, row.list.id);
}

export async function createList(db: Database, ownerId: string, input: { name: string; description?: string; isPublic?: boolean; tags?: string[] }) {
  const slug = input.name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `lista-${Date.now()}`;
  try {
    const [created] = await db.insert(userLists).values({ ownerId, slug, name: input.name.trim(), description: input.description?.trim() || null, isPublic: input.isPublic ?? true, tags: input.tags ?? [] }).returning();
    if (!created) throw new ResourceNotFoundError('List was not created');
    return getList(db, created.id);
  } catch (error) {
    if (error instanceof Error && error.message.includes('user_lists_owner_slug_unique')) throw new ConflictError('List already exists');
    throw error;
  }
}

export async function updateList(db: Database, ownerId: string, listId: string, input: { name: string; description?: string; isPublic?: boolean; tags?: string[] }) {
  const [updated] = await db.update(userLists).set({ name: input.name.trim(), description: input.description?.trim() || null, isPublic: input.isPublic, tags: input.tags, updatedAt: new Date() }).where(and(eq(userLists.id, listId), eq(userLists.ownerId, ownerId))).returning();
  if (!updated) throw new ResourceNotFoundError('List not found');
  return getList(db, updated.id);
}

export async function deleteList(db: Database, ownerId: string, listId: string) {
  const [deleted] = await db.delete(userLists).where(and(eq(userLists.id, listId), eq(userLists.ownerId, ownerId))).returning({ id: userLists.id });
  if (!deleted) throw new ResourceNotFoundError('List not found');
  return deleted;
}

export async function addListGame(db: Database, ownerId: string, listId: string, game: GameSnapshot & { id?: string | number; slug?: string }) {
  const [list] = await db.select({ id: userLists.id }).from(userLists).where(and(eq(userLists.id, listId), eq(userLists.ownerId, ownerId)));
  if (!list) throw new ResourceNotFoundError('List not found');
  await db.insert(userListGames).values({ listId, gameId: String(game.id ?? game.slug), gameSlug: String(game.slug ?? game.id), game, position: 0 }).onConflictDoNothing();
  return getList(db, listId);
}

export async function removeListGame(db: Database, ownerId: string, listId: string, gameId: string) {
  const [list] = await db.select({ id: userLists.id }).from(userLists).where(and(eq(userLists.id, listId), eq(userLists.ownerId, ownerId)));
  if (!list) throw new ResourceNotFoundError('List not found');
  await db.delete(userListGames).where(and(eq(userListGames.listId, listId), or(eq(userListGames.gameId, gameId), eq(userListGames.gameSlug, gameId))));
  return getList(db, listId);
}

export async function toggleListLike(db: Database, userId: string, listId: string) {
  return executeTransaction(db, async (tx) => {
    const [list] = await tx.select({ id: userLists.id }).from(userLists).where(eq(userLists.id, listId));
    if (!list) throw new ResourceNotFoundError('List not found');

    const [existing] = await tx.select().from(userListLikes).where(and(eq(userListLikes.userId, userId), eq(userListLikes.listId, listId)));
    if (existing) {
      await tx.delete(userListLikes).where(and(eq(userListLikes.userId, userId), eq(userListLikes.listId, listId)));
      await tx.update(userLists).set({ likesCount: sql`greatest(${userLists.likesCount} - 1, 0)` }).where(eq(userLists.id, listId));
      return { isLiked: false };
    }

    await tx.insert(userListLikes).values({ userId, listId });
    await tx.update(userLists).set({ likesCount: sql`${userLists.likesCount} + 1` }).where(eq(userLists.id, listId));
    return { isLiked: true };
  });
}
