import { env } from '@/env';
import { homeFeedDataSchema } from './schemas';
import type { HomeFeedData } from './types';

export async function getHomeFeed(): Promise<HomeFeedData> {
  try {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/home`, { next: { revalidate: 60 } });
    if (res.ok) {
      const parsed = homeFeedDataSchema.safeParse(await res.json());
      if (parsed.success) return parsed.data;
    }
  } catch (error) {
    console.error('getHomeFeed failed:', error);
  }
  return {
    popularGames: [],
    topRatedGames: [],
    upcomingGames: [],
    popularReviews: [],
    activities: []
  };
}
