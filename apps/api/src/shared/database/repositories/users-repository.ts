import { eq } from 'drizzle-orm';
import type { Database } from '..';
import { users, type User } from '../schemas';

class UsersRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: User['email']) {
    const user = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user[0]) return null;

    return user[0];
  }
}

export function createUsersRepository(db: Database) {
  return new UsersRepository(db);
}
