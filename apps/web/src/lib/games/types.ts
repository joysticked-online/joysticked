export interface Game {
  id: number | string;
  name: string;
  slug: string;
  summary?: string | null;
  storyline?: string | null;
  coverUrl?: string | null;
  bannerUrl?: string | null;
  artworks?: string[];
  screenshots?: string[];
  genres?: string[];
  platforms?: string[];
  gameModes?: string[];
  firstReleaseDate?: string | null;
  releaseYear?: string | null;
  developer?: string | null;
  publisher?: string | null;
  rating?: number | null;
  aggregatedRating?: number | null;
  ratingCount?: number | null;
  totalRating?: number | null;
  similarGames?: Game[];
  recommendedGames?: Game[];
  isSteamAwaited?: boolean;
  isSteamTopSeller?: boolean;
  isSteamNewRelease?: boolean;
}

export interface ReviewUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface GameReview {
  id: string;
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  userId: string;
  user: ReviewUser;
  rating: number;
  reviewText: string | null;
  containsSpoiler?: boolean;
  platform: string | null;
  hoursPlayed: string | null;
  likesCount: number;
  createdAt: string;
}

export interface GameActivity {
  id: string;
  gameId: string;
  gameSlug: string;
  gameTitle: string;
  userId: string;
  user: ReviewUser;
  type: string;
  detail: string | null;
  platform: string | null;
  createdAt: string;
}

export interface GameDetailsResponse {
  game: Game;
  reviews: GameReview[];
  activities: GameActivity[];
  similarGames?: Game[];
  recommendedGames?: Game[];
}

export interface DiscoverResponse {
  games: Game[];
  basedOn: string[];
  hasMore: boolean;
}

export interface HomeFeedData {
  popularGames: Game[];
  topRatedGames: Game[];
  upcomingGames?: Game[];
  popularReviews: GameReview[];
  activities: GameActivity[];
}
