import { api } from './client';
import type { ApiResponse, AuthPayload, User } from '../types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export interface ProfileInput {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

export interface PasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  login: async (payload: LoginInput): Promise<AuthPayload> => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/login', payload);
    return response.data.data;
  },

  register: async (payload: RegisterInput): Promise<AuthPayload> => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/register', payload);
    return response.data.data;
  },

  refresh: async (): Promise<AuthPayload> => {
    const response = await api.post<ApiResponse<AuthPayload>>('/auth/refresh');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  },

  updateProfile: async (payload: ProfileInput): Promise<User> => {
    const response = await api.patch<ApiResponse<{ user: User }>>('/auth/profile', payload);
    return response.data.data.user;
  },

  updatePassword: async (payload: PasswordInput): Promise<AuthPayload> => {
    const response = await api.patch<ApiResponse<AuthPayload>>('/auth/password', payload);
    return response.data.data;
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/auth/account', { data: { password } });
  },
};
