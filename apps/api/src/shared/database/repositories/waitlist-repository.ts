import { desc, eq, sql } from 'drizzle-orm';

import type { Database } from '..';
import { waitlists } from '../schemas/waitlists';

class WaitListRepository {
  constructor(private readonly db: Database) {}

  async findEntryByEmail(email: string) {
    const opt = await this.db.select().from(waitlists).where(eq(waitlists.email, email));

    if (!opt[0]) return null;

    return opt[0];
  }

  async createEntry(email: string) {
    await this.db.insert(waitlists).values({ email });
  }

  async deleteEntry(id: number) {
    await this.db.delete(waitlists).where(eq(waitlists.id, id));
  }

  async getAllEntries() {
    const entries = await this.db.select().from(waitlists).orderBy(desc(waitlists.createdAt));

    return entries;
  }

  async getEntriesCount() {
    const count = await this.db.select({ count: sql<number>`count(*)` }).from(waitlists);

    return count[0].count;
  }
}

export function createWaitListRepository(db: Database) {
  return new WaitListRepository(db);
}
