import { useCallback, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  changePassword as changePasswordThunk,
  login as loginThunk,
  logout as logoutThunk,
  register as registerThunk,
  setUser as setUserAction,
  updateProfile as updateProfileThunk,
} from '../store/slices/authSlice';
import { apiErrorMessage } from '../api/client';
import { authApi, type LoginInput, type PasswordInput, type ProfileInput, type RegisterInput } from '../api/auth';
import type { AuthPayload, User } from '../types';

export interface AuthResult {
  success: true;
  message: string;
  data: AuthPayload;
}

function asError(error: unknown): Error {
  return new Error(typeof error === 'string' ? error : apiErrorMessage(error));
}

/**
 * Redux-backed compatibility hook. Components keep the familiar `useAuth()`
 * API, while the actual session state lives in the Redux store.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginInput): Promise<AuthResult> => {
      try {
        const payload = await dispatch(loginThunk(credentials)).unwrap();
        return {
          success: true,
          message: `Welcome back, ${payload.user.name.split(' ')[0]}!`,
          data: payload,
        };
      } catch (loginError) {
        throw asError(loginError);
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload: RegisterInput): Promise<AuthResult> => {
      try {
        const result = await dispatch(registerThunk(payload)).unwrap();
        return {
          success: true,
          message: `Welcome to SayonaraAnime, ${result.user.name.split(' ')[0]}!`,
          data: result,
        };
      } catch (registerError) {
        throw asError(registerError);
      }
    },
    [dispatch]
  );

  const logout = useCallback(async (): Promise<void> => {
    await dispatch(logoutThunk());
  }, [dispatch]);

  const setUser = useCallback(
    (nextUser: User) => {
      dispatch(setUserAction(nextUser));
    },
    [dispatch]
  );

  const updateProfile = useCallback(
    async (payload: ProfileInput): Promise<User> => {
      try {
        return await dispatch(updateProfileThunk(payload)).unwrap();
      } catch (profileError) {
        throw asError(profileError);
      }
    },
    [dispatch]
  );

  const changePassword = useCallback(
    async (payload: PasswordInput): Promise<AuthPayload> => {
      try {
        return await dispatch(changePasswordThunk(payload)).unwrap();
      } catch (passwordError) {
        throw asError(passwordError);
      }
    },
    [dispatch]
  );

  const deleteAccount = useCallback(async (password: string): Promise<void> => {
    await authApi.deleteAccount(password);
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    initializing: status === 'idle' || status === 'loading',
    error,
    login,
    register,
    logout,
    setUser,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}

/** Kept so old imports keep working; state now comes from the Redux Provider. */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
