import { and, eq, inArray } from 'drizzle-orm';
import type { Database } from '../../../shared/database';
import { gameActivities } from '../../../shared/database/schemas';

export async function getPlayedGameSlugs(db: Database, userId: string) {
  const activities = await db
    .select({ slug: gameActivities.gameSlug })
    .from(gameActivities)
    .where(
      and(
        eq(gameActivities.userId, userId),
        inArray(gameActivities.type, ['played', 'completed', 'rated'])
      )
    )
    .limit(20);

  return activities.map((activity) => activity.slug);
}
