import { and, eq } from 'drizzle-orm';

import { InternalServerError } from '../../errors/internal-server-error';
import type { Database } from '..';
import { oauthAccounts } from '../schemas/oauth-accounts';
import type { Transaction } from '../transaction';

type CreateOAuthAccountData = {
  provider: string;
  providerId: string;
  userId: string;
};

class OAuthAccountRepository {
  constructor(private readonly db: Database) {}

  /**
   * Looks up an existing OAuth account link.
   * Returns the linked userId, or null if no link exists for this provider + providerId pair.
   */
  async findByProvider(provider: string, providerId: string) {
    const result = await this.db
      .select()
      .from(oauthAccounts)
      .where(and(eq(oauthAccounts.provider, provider), eq(oauthAccounts.providerId, providerId)));

    if (!result[0]) return null;

    return result[0];
  }

  /**
   * Links an OAuth provider identity to an existing Joysticked user.
   * Called when a user first signs in via a provider, or when we auto-link
   * a new provider to an existing user based on matching email.
   */
  async create(data: CreateOAuthAccountData, tx?: Transaction) {
    const result = await (tx ?? this.db).insert(oauthAccounts).values(data).returning();

    if (!result[0]) throw new InternalServerError('Failed to create OAuth account link');

    return result[0];
  }

  /** Removes all OAuth account links for a given user — used when deleting a user account. */
  async deleteByUserId(userId: string) {
    await this.db.delete(oauthAccounts).where(eq(oauthAccounts.userId, userId));
  }
}

export function createOAuthAccountRepository(db: Database) {
  return new OAuthAccountRepository(db);
}
