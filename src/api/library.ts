import type { AxiosResponse } from 'axios';
import { api } from './client';
import type {
  ApiResponse,
  HistoryEntry,
  HistoryPayload,
  LibraryStats,
  Review,
  ReviewPayload,
  WatchStatus,
  WatchlistEntry,
  WatchlistPayload,
} from '../types';

const data = <T, M = Record<string, unknown>>(
  response: AxiosResponse<ApiResponse<T, M>>
): ApiResponse<T, M> => response.data;

export interface ReviewMeta {
  total: number;
  average: number | null;
}

export const libraryApi = {
  /* Watchlist */
  getWatchlist: (params?: { status?: WatchStatus }) =>
    api
      .get<ApiResponse<WatchlistEntry[]>>('/library/watchlist', { params })
      .then((response) => data(response)),

  getWatchlistEntry: (malId: number) =>
    api
      .get<ApiResponse<WatchlistEntry | null>>(`/library/watchlist/${malId}`)
      .then((response) => data(response)),

  addToWatchlist: (payload: WatchlistPayload) =>
    api
      .post<ApiResponse<WatchlistEntry>>('/library/watchlist', payload)
      .then((response) => data(response)),

  updateWatchlistStatus: (malId: number, status: WatchStatus) =>
    api
      .patch<ApiResponse<WatchlistEntry>>(`/library/watchlist/${malId}`, { status })
      .then((response) => data(response)),

  removeFromWatchlist: (malId: number) =>
    api
      .delete<ApiResponse<null>>(`/library/watchlist/${malId}`)
      .then((response) => data(response)),

  /* History */
  getHistory: (params?: { limit?: number }) =>
    api
      .get<ApiResponse<HistoryEntry[]>>('/library/history', { params })
      .then((response) => data(response)),

  saveProgress: (payload: HistoryPayload) =>
    api
      .post<ApiResponse<HistoryEntry>>('/library/history', payload)
      .then((response) => data(response)),

  removeHistoryEntry: (malId: number) =>
    api
      .delete<ApiResponse<null>>(`/library/history/${malId}`)
      .then((response) => data(response)),

  clearHistory: () =>
    api.delete<ApiResponse<null>>('/library/history').then((response) => data(response)),

  /* Reviews */
  getReviews: (malId: number) =>
    api
      .get<ApiResponse<Review[], ReviewMeta>>(`/library/reviews/${malId}`)
      .then((response) => data(response)),

  saveReview: (malId: number, payload: ReviewPayload) =>
    api
      .post<ApiResponse<Review>>(`/library/reviews/${malId}`, payload)
      .then((response) => data(response)),

  deleteReview: (id: string) =>
    api.delete<ApiResponse<null>>(`/library/reviews/${id}`).then((response) => data(response)),

  getMyReviews: () =>
    api.get<ApiResponse<Review[]>>('/library/reviews').then((response) => data(response)),

  /* Stats + report */
  getStats: () =>
    api.get<ApiResponse<LibraryStats>>('/library/stats').then((response) => data(response)),

  getReportBlob: async (): Promise<Blob> => {
    const response = await api.get<Blob>('/library/report.pdf', { responseType: 'blob' });
    return response.data;
  },
};
