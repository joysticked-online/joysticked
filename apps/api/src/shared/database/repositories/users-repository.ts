import { eq, or } from 'drizzle-orm';

import { InternalServerError } from '../../errors/internal-server-error';
import type { Database } from '..';
import { users, type User } from '../schemas';

class UsersRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: User['email']) {
    const user = await this.db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user[0]) return null;

    return user[0];
  }

  async findByFirstIdentifier({ email, username }: Pick<User, 'username' | 'email'>) {
    const user = await this.db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)))
      .limit(1);

    if (user[0]) return null;

    return user[0];
  }

  async create(
    data: Pick<
      User,
      | 'username'
      | 'email'
      | 'avatarUrl'
      | 'bannerUrl'
      | 'bio'
      | 'socials'
      | 'pronouns'
      | 'isPrivate'
      | 'location'
    >
  ) {
    const user = await this.db.insert(users).values(data).returning();

    if (!user[0]) throw new InternalServerError('User not created');

    return user[0];
  }
}

export function createUsersRepository(db: Database) {
  return new UsersRepository(db);
}
