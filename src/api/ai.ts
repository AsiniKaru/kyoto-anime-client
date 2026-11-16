import { api } from './client';
import type { ApiResponse, Anime } from '../types';

export interface AiRecommendationResponse {
  recommendations: Anime[];
}

export const aiApi = {
  recommend: async (prompt: string, genres?: string[]): Promise<AiRecommendationResponse> => {
    const response = await api.post<ApiResponse<AiRecommendationResponse>>('/ai/recommend', { prompt, genres });
    return response.data.data;
  },
};
