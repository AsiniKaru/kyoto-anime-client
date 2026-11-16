export interface AnimeCardData {
  mal_id: number;
  title: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string }; webp?: { large_image_url?: string } };
  score?: number;
  year?: number;
  episodes?: number;
  status?: string;
  synopsis?: string;
  genres?: { mal_id: number; name: string }[];
  type?: string;
}

export interface EpisodeData {
  mal_id: number;
  title?: string;
  episode?: string;
  aired?: string;
  score?: number;
  filler?: boolean;
  recap?: boolean;
}

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  watchlist?: any[];
  history?: any[];
}
