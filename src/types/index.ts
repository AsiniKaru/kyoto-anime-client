export type UserRole = 'user' | 'admin';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface ApiResponse<T, M = Record<string, unknown>> {
  success: boolean;
  data: T;
  message?: string;
  meta?: M;
  details?: unknown;
}

export interface AnimeGenre {
  malId: number;
  name: string;
}

export interface AnimeTrailer {
  youtubeId: string;
  url: string;
  embedUrl: string;
  image: string;
}

export interface StreamingLink {
  name: string;
  url: string;
}

export interface Anime {
  malId: number;
  anilistId: number;
  idMal: number | null;
  title: string;
  titleDefault: string;
  titleJapanese: string;
  synopsis: string;
  background: string;
  type: string;
  formatKey: string;
  source: string;
  episodes: number | null;
  status: string;
  statusKey: string;
  airing: boolean;
  aired: string;
  year: number | null;
  season: string;
  duration: string;
  rating: string;
  score: number | null;
  scoredBy: number;
  rank: number | null;
  popularity: number;
  members: number;
  favorites: number;
  genres: AnimeGenre[];
  themes: AnimeGenre[];
  demographics: AnimeGenre[];
  studios: string[];
  producers: string[];
  licensors: string[];
  image: string;
  imageSmall: string;
  backdrop: string;
  trailer: AnimeTrailer | null;
  streaming: StreamingLink[];
  externalUrl: string;
  cached?: boolean;
}

export interface Pagination {
  page: number;
  lastPage: number;
  hasNextPage: boolean;
  items: number | null;
  limit: number;
}

export interface HomeData {
  hero: Anime[];
  trending: Anime[];
  latest: Anime[];
  topRated: Anime[];
  upcoming: Anime[];
  genres: Array<AnimeGenre & { count: number }>;
  source: 'live' | 'cached';
}

export interface Episode {
  malId: number;
  number: number;
  title: string;
  titleJapanese: string;
  aired: string | null;
  filler: boolean;
  recap: boolean;
}

export interface Character {
  malId: number;
  name: string;
  image: string;
  role: string;
  voiceActor: string;
}

export interface Recommendation {
  malId: number;
  title: string;
  image: string;
}

export interface ResolvedTrailer {
  source: 'anilist' | 'youtube' | 'search';
  videoId: string | null;
  embedUrl: string | null;
  watchUrl: string;
  searchUrl: string;
  title: string;
  image?: string;
}

export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped';

export interface WatchlistEntry {
  _id: string;
  malId: number;
  title: string;
  image: string;
  year: number | null;
  score: number | null;
  type: string;
  genres: string[];
  status: WatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  _id: string;
  malId: number;
  title: string;
  image: string;
  episode: number;
  progress: number;
  durationSeconds: number;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  id?: string;
  malId: number;
  animeTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id?: string | null;
    name: string;
    avatar?: string;
  };
}

export interface ReviewSummary {
  reviews: Review[];
  total: number;
  average: number | null;
}

export interface LibraryStats {
  byStatus: Partial<Record<WatchStatus, number>>;
  watchlistTotal: number;
  historyCount: number;
  reviewCount: number;
  continueWatching: HistoryEntry[];
  minutesWatched: number;
}

export interface WatchlistPayload {
  malId: number;
  title: string;
  image?: string;
  year?: number | null;
  score?: number | null;
  type?: string;
  genres?: string[];
  status?: WatchStatus;
}

export interface HistoryPayload {
  malId: number;
  title: string;
  image?: string;
  episode: number;
  progress: number;
  durationSeconds: number;
}

export interface ReviewPayload {
  rating: number;
  comment?: string;
  animeTitle?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio: string;
  createdAt: string;
  stats: { watchlist: number; reviews: number };
}

export interface AdminStats {
  totals: {
    users: number;
    admins: number;
    watchlist: number;
    history: number;
    reviews: number;
  };
  averageRating: number | null;
  signups: Array<{ date: string; count: number }>;
  topAnime: Array<{ malId: number; title: string; image: string; count: number }>;
  topGenres: Array<{ genre: string; count: number }>;
  statusDistribution: Array<{ status: WatchStatus; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    createdAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    animeTitle: string;
    createdAt: string;
    user: { id: string | null; name: string };
  }>;
}

export interface BrowseFilters {
  q: string;
  genres: string[];
  year: string;
  season: string;
  type: string;
  status: string;
  orderBy: string;
  minScore: string;
  maxScore: string;
}
