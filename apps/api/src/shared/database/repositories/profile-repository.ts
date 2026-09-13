import { eq } from 'drizzle-orm';

import { InternalServerError } from '../../errors/internal-server-error';
import { ResourceNotFoundError } from '../../errors/resource-not-found-error';
import type { Database } from '..';
import { users } from '../schemas/users';
import type { Transaction } from '../transaction';

type CreateProfileData = {
  username: string;
  displayName?: string | null;
  onboardingCompleted?: boolean;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  socials?: {
    twitter?: string | null;
    twitch?: string | null;
    discord?: string | null;
    steam?: string | null;
    steamId?: string | null;
    steamPublic?: boolean | null;
    instagram?: string | null;
  } | null;
  preferences?: {
    platforms?: string[];
    genres?: string[];
    likedGames?: string[];
  } | null;
};

type UpdateProfileData = Partial<CreateProfileData>;

class ProfileRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string) {
    const result = await this.db.select().from(users).where(eq(users.id, id));

    if (!result[0]) return null;

    return result[0];
  }

  async findByUsername(username: string) {
    const result = await this.db.select().from(users).where(eq(users.username, username));

    if (!result[0]) return null;

    return result[0];
  }

  async create(data: CreateProfileData, tx?: Transaction) {
    const result = await (tx ?? this.db).insert(users).values(data).returning();

    if (!result[0]) throw new InternalServerError('Failed to create user profile');

    return result[0];
  }

  async update(id: string, data: UpdateProfileData, tx?: Transaction) {
    const result = await (tx ?? this.db)
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    if (!result[0]) throw new ResourceNotFoundError('User profile not found');

    return result[0];
  }

  async delete(id: string) {
    await this.db.delete(users).where(eq(users.id, id));
  }
}

export function createProfileRepository(db: Database) {
  return new ProfileRepository(db);
}
