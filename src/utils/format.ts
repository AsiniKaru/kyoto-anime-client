import type { WatchStatus } from '../types';

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  completed: 'Completed',
  plan_to_watch: 'Plan to watch',
  on_hold: 'On hold',
  dropped: 'Dropped',
};

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export const WATCH_STATUS_OPTIONS: Array<SelectOption<WatchStatus>> = (
  Object.entries(WATCH_STATUS_LABELS) as Array<[WatchStatus, string]>
).map(([value, label]) => ({ value, label }));

export const SEASONS: SelectOption[] = [
  { value: 'winter', label: 'Winter' },
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
];

export const ANIME_TYPES: SelectOption[] = [
  { value: 'tv', label: 'TV Series' },
  { value: 'movie', label: 'Movie' },
  { value: 'ova', label: 'OVA' },
  { value: 'ona', label: 'ONA' },
  { value: 'special', label: 'Special' },
  { value: 'music', label: 'Music' },
];

export const AIRING_STATUSES: SelectOption[] = [
  { value: 'airing', label: 'Airing' },
  { value: 'complete', label: 'Finished' },
  { value: 'upcoming', label: 'Upcoming' },
];

export const SORT_OPTIONS: SelectOption[] = [
  { value: 'popularity', label: 'Most popular' },
  { value: 'score', label: 'Highest rated' },
  { value: 'latest', label: 'Newest first' },
  { value: 'members', label: 'Most members' },
  { value: 'favorites', label: 'Most favourited' },
  { value: 'title', label: 'Title (A-Z)' },
];

export interface Filters {
  q: string;
  genres: string[];
  year: string;
  season: string;
  type: string;
  status: string;
  orderBy: string;
  page: number;
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  genres: [],
  year: '',
  season: '',
  type: '',
  status: '',
  orderBy: 'popularity',
  page: 1,
};

export const currentYear = new Date().getFullYear();

export const YEAR_OPTIONS: number[] = Array.from(
  { length: currentYear - 1959 },
  (_, index) => currentYear - index
);

export function formatCount(value: number | null | undefined): string {
  const number = Number(value) || 0;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1).replace('.0', '')}K`;
  return String(number);
}

export function formatScore(score: number | null | undefined): string {
  return score ? Number(score).toFixed(1) : 'N/A';
}

export function animeYear(anime: { year?: number | null } | null | undefined): number | string {
  return anime?.year || '—';
}

export function cleanSynopsis(
  text: string | null | undefined,
  fallback = 'No synopsis available for this title yet.'
): string {
  if (!text) return fallback;
  return text.replace(/\[Written by MAL Rewrite\]/gi, '').replace(/\s+/g, ' ').trim();
}

export function timeAgo(dateString: string | Date): string {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initials(name = ''): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function filtersFromSearchParams(searchParams: URLSearchParams): Filters {
  return {
    q: searchParams.get('q') || '',
    genres: (searchParams.get('genres') || '').split(',').filter(Boolean),
    year: searchParams.get('year') || '',
    season: searchParams.get('season') || '',
    type: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    orderBy: searchParams.get('orderBy') || 'popularity',
    page: Number(searchParams.get('page')) || 1,
  };
}

export function filtersToSearchParams(filters: Partial<Filters>): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.q) params.q = filters.q;
  if (filters.genres?.length) params.genres = filters.genres.join(',');
  if (filters.year) params.year = filters.year;
  if (filters.season) params.season = filters.season;
  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  if (filters.orderBy && filters.orderBy !== 'popularity') params.orderBy = filters.orderBy;
  if (filters.page && filters.page > 1) params.page = String(filters.page);
  return params;
}

/** Compact pagination window: 1 … 4 5 [6] 7 8 … 20 */
export function paginationWindow(
  current: number,
  last: number,
  delta = 2
): Array<number | string> {
  const pages: Array<number | string> = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(last - 1, current + delta);

  pages.push(1);
  if (left > 2) pages.push('start-ellipsis');
  for (let page = left; page <= right; page += 1) pages.push(page);
  if (right < last - 1) pages.push('end-ellipsis');
  if (last > 1) pages.push(last);

  return pages;
}
