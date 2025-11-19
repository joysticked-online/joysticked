import { desc, eq, sql } from 'drizzle-orm';

import { InternalServerError } from '../../errors/internal-server-error';
import type { Database } from '..';
import { waitlists } from '../schemas/waitlists';
import type { Transaction } from '../transaction';

class WaitListRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string) {
    const opt = await this.db.select().from(waitlists).where(eq(waitlists.email, email));

    if (!opt[0]) return null;

    return opt[0];
  }

  async create(email: string, tx?: Transaction) {
    const entry = await (tx ?? this.db).insert(waitlists).values({ email }).returning();

    if (!entry[0]) throw new InternalServerError('Failed to create waitlist entry');

    return entry[0];
  }

  async delete(id: number) {
    await this.db.delete(waitlists).where(eq(waitlists.id, id));
  }

  async deleteByEmail(email: string, tx?: Transaction) {
    await (tx ?? this.db).delete(waitlists).where(eq(waitlists.email, email));
  }

  async getAll() {
    const entries = await this.db.select().from(waitlists).orderBy(desc(waitlists.joinedAt));

    return entries;
  }

  async getCount() {
    const count = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(waitlists);

    return count[0].count;
  }
}

export function createWaitListRepository(db: Database) {
  return new WaitListRepository(db);
}
