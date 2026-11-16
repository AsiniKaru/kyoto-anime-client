import type { AxiosResponse } from 'axios';
import { api } from './client';
import type { AdminStats, AdminUser, ApiResponse, User, UserRole } from '../types';

const data = <T, M = Record<string, unknown>>(
  response: AxiosResponse<ApiResponse<T, M>>
): ApiResponse<T, M> => response.data;

export interface AdminUsersMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

export interface AdminReview {
  id: string;
  malId: number;
  rating: number;
  comment: string;
  animeTitle: string;
  createdAt: string;
  user: { id: string | null; name: string };
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data.data;
  },

  getUsers: (params: { page?: number; limit?: number; q?: string }) =>
    api
      .get<ApiResponse<AdminUser[], AdminUsersMeta>>('/admin/users', { params })
      .then((response) => data(response)),

  updateRole: (id: string, role: UserRole) =>
    api
      .patch<ApiResponse<{ user: User }>>(`/admin/users/${id}/role`, { role })
      .then((response) => data(response)),

  deleteUser: (id: string) =>
    api.delete<ApiResponse<null>>(`/admin/users/${id}`).then((response) => data(response)),

  getReviews: () =>
    api.get<ApiResponse<AdminReview[]>>('/admin/reviews').then((response) => data(response)),

  getReportBlob: async (): Promise<Blob> => {
    const response = await api.get<Blob>('/admin/report.pdf', { responseType: 'blob' });
    return response.data;
  },
};

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
