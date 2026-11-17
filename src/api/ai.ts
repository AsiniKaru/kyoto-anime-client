import { api } from './client';
import type { ApiResponse, Anime } from '../types';

export interface AiRecommendationResponse {
  recommendations: Anime[];
}

export interface MagicSearchResponse {
  results: Anime[];
}

export const aiApi = {
  recommend: async (prompt: string, genres?: string[]): Promise<AiRecommendationResponse> => {
    const response = await api.post<ApiResponse<AiRecommendationResponse>>('/ai/recommend', { prompt, genres });
    return response.data.data;
  },
  magicSearch: async (query: string): Promise<MagicSearchResponse> => {
    const response = await api.post<ApiResponse<MagicSearchResponse>>('/ai/magic-search', { query });
    return response.data.data;
  },
};
