export type IgdbGame = {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  coverUrl?: string;
  bannerUrl?: string;
  artworks?: string[];
  screenshots?: string[];
  genres: string[];
  platforms: string[];
  gameModes?: string[];
  firstReleaseDate?: string;
  releaseYear?: string;
  developer?: string;
  publisher?: string;
  rating?: number;
  aggregatedRating?: number;
  category?: number;
  genreIds?: number[];
  similarGames?: IgdbGame[];
  recommendedGames?: IgdbGame[];
};

export type IgdbRawGame = {
  id: number;
  name: string;
  slug: string;
  category?: number;
  summary?: string;
  storyline?: string;
  cover?: { id: number; image_id?: string; url?: string };
  artworks?: { id: number; image_id?: string; url?: string }[];
  screenshots?: { id: number; image_id?: string; url?: string }[];
  genres?: { id: number; name: string }[];
  platforms?: { id: number; name: string; abbreviation?: string }[];
  game_modes?: { id: number; name: string }[];
  first_release_date?: number;
  rating?: number;
  aggregated_rating?: number;
  involved_companies?: {
    id: number;
    developer: boolean;
    publisher: boolean;
    company?: { id: number; name: string };
  }[];
  similar_games?: (IgdbRawGame | number)[];
};
