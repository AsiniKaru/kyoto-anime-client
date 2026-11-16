import type { AxiosResponse } from 'axios';
import { api } from './client';
import type {
  Anime,
  AnimeGenre,
  ApiResponse,
  Character,
  Episode,
  HomeData,
  Pagination,
  Recommendation,
  ResolvedTrailer,
} from '../types';

const data = <T, M = Record<string, unknown>>(
  response: AxiosResponse<ApiResponse<T, M>>
): ApiResponse<T, M> => response.data;

export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  genres?: string;
  year?: string | number;
  season?: string;
  type?: string;
  status?: string;
  orderBy?: string;
  minScore?: string | number;
  maxScore?: string | number;
}

export interface SearchMeta {
  pagination: Pagination;
  filters?: Record<string, unknown>;
  source?: 'live' | 'cached';
}

export const animeApi = {
  getHome: () =>
    api.get<ApiResponse<HomeData>>('/anime/home').then((response) => data(response)),

  search: (params: SearchParams) =>
    api
      .get<ApiResponse<Anime[], SearchMeta>>('/anime/search', { params })
      .then((response) => data(response)),

  getById: (id: number | string) =>
    api
      .get<ApiResponse<{ anime: Anime; trailer: ResolvedTrailer }>>(`/anime/${id}`)
      .then((response) => data(response)),

  getEpisodes: (id: number | string, page = 1) =>
    api
      .get<ApiResponse<Episode[], { pagination: Pagination; totalEpisodes: number }>>(
        `/anime/${id}/episodes`,
        { params: { page } }
      )
      .then((response) => data(response)),

  getRecommendations: (id: number | string) =>
    api
      .get<ApiResponse<Recommendation[]>>(`/anime/${id}/recommendations`)
      .then((response) => data(response)),

  getCharacters: (id: number | string) =>
    api
      .get<ApiResponse<Character[]>>(`/anime/${id}/characters`)
      .then((response) => data(response)),

  getTrailer: (id: number | string) =>
    api
      .get<ApiResponse<{ malId: number; title: string; trailer: ResolvedTrailer | null }>>(
        `/anime/${id}/trailer`
      )
      .then((response) => data(response)),

  getGenres: () =>
    api
      .get<ApiResponse<Array<AnimeGenre & { count: number }>>>('/anime/genres')
      .then((response) => data(response)),

  getSeasonal: (params: { year?: number; season?: string; page?: number; limit?: number }) =>
    api
      .get<ApiResponse<Anime[], SearchMeta>>('/anime/seasonal', { params })
      .then((response) => data(response)),

  getRandom: () =>
    api
      .get<ApiResponse<{ malId: number; title: string; image: string }>>('/anime/random')
      .then((response) => data(response)),
};
