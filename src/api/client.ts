import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, AuthPayload } from '../types';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// The access token is kept in memory (never localStorage); the refresh token is
// an httpOnly cookie, so a page reload restores the session through /auth/refresh.
let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;
let sessionRefreshPromise: Promise<AuthPayload> | null = null;

/**
 * Shared refresh call used by both the Axios interceptor and the Redux
 * bootstrap thunk. Refresh tokens rotate, so two concurrent calls with the
 * same cookie would invalidate each other; this guarantees a single request.
 */
export function refreshSession(): Promise<AuthPayload> {
  if (!sessionRefreshPromise) {
    sessionRefreshPromise = refreshClient
      .post<ApiResponse<AuthPayload>>('/auth/refresh')
      .then((response) => {
        const payload = response.data.data;
        setAccessToken(payload.accessToken);
        return payload;
      })
      .finally(() => {
        sessionRefreshPromise = null;
      });
  }

  return sessionRefreshPromise;
}

async function refreshAccessToken(): Promise<string | null> {
  const payload = await refreshSession();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<AuthPayload>('auth:refreshed', { detail: payload }));
  }

  return payload.accessToken;
}

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const url = String(original?.url || '');
    const isSessionEndpoint = /\/(login|register|refresh|logout)(\?|$)/.test(url);

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isSessionEndpoint
    ) {
      original._retry = true;

      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const token = await refreshPromise;
        refreshPromise = null;

        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        refreshPromise = null;
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:expired'));
        }
      }
    }

    return Promise.reject(error);
  }
);

interface ErrorBody {
  message?: string;
  details?: unknown;
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorBody | undefined;
    const details = data?.details;

    if (Array.isArray(details)) {
      const messages = details
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'message' in item) {
            return String((item as { message?: unknown }).message ?? '');
          }
          return '';
        })
        .filter(Boolean);

      if (messages.length) return messages.join(', ');
    }

    if (data?.message) return data.message;

    if (error.code === 'ECONNABORTED') {
      return 'The request took too long. Please try again.';
    }

    return error.message || 'Network error. Is the backend running?';
  }

  return error instanceof Error ? error.message : 'Something went wrong';
}

export default api;
