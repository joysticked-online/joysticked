import { eq } from 'drizzle-orm';

import { InternalServerError } from '../../errors/internal-server-error';
import type { Database } from '..';
import { users } from '../schemas/users';
import type { Transaction } from '../transaction';

/** Generates a temporary username for new accounts created via auth (magic link / OAuth).
 *  The user can change this later on their profile page.
 */
function generateTempUsername(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `user_${hex}`;
}

class UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string) {
    const result = await this.db.select().from(users).where(eq(users.id, id));

    if (!result[0]) return null;

    return result[0];
  }

  async findByEmail(email: string) {
    const result = await this.db.select().from(users).where(eq(users.email, email));

    if (!result[0]) return null;

    return result[0];
  }

  /**
   * Creates a minimal user record for new sign-ups (magic link or OAuth).
   * A temporary username is auto-generated; the user sets a real one via /profile.
   */
  async createWithEmail(email: string, tx?: Transaction) {
    const result = await (tx ?? this.db)
      .insert(users)
      .values({
        username: generateTempUsername(),
        email,
        emailVerified: false
      })
      .returning();

    if (!result[0]) throw new InternalServerError('Failed to create user');

    return result[0];
  }

  /**
   * Creates a minimal user record for OAuth sign-ups where no email is returned
   * by the provider (e.g., Discord with hidden email setting).
   */
  async createWithoutEmail(tx?: Transaction) {
    const result = await (tx ?? this.db)
      .insert(users)
      .values({ username: generateTempUsername() })
      .returning();

    if (!result[0]) throw new InternalServerError('Failed to create user');

    return result[0];
  }

  /**
   * Marks the user's email as verified — called after magic link confirmation
   * or when an OAuth provider returns a verified email.
   */
  async setEmailVerified(id: string, tx?: Transaction) {
    await (tx ?? this.db).update(users).set({ emailVerified: true }).where(eq(users.id, id));
  }

  /**
   * Updates (or sets for the first time) the email address on a user record —
   * used when linking an OAuth account that returns an email to an existing
   * user who has no email yet.
   */
  async setEmail(id: string, email: string, verified: boolean, tx?: Transaction) {
    await (tx ?? this.db)
      .update(users)
      .set({ email, emailVerified: verified })
      .where(eq(users.id, id));
  }
}

export function createUserRepository(db: Database) {
  return new UserRepository(db);
}
