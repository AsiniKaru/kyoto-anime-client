import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi, type LoginInput, type PasswordInput, type ProfileInput, type RegisterInput } from '../../api/auth';
import { apiErrorMessage, refreshSession, setAccessToken } from '../../api/client';
import type { AuthPayload, User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
  error: null,
};

interface RejectValue {
  rejectValue: string;
}

/** Restores the session from the httpOnly refresh cookie on page load. */
export const bootstrapAuth = createAsyncThunk<AuthPayload | null, void>(
  'auth/bootstrap',
  async () => {
    try {
      return await refreshSession();
    } catch {
      setAccessToken(null);
      return null;
    }
  }
);

export const login = createAsyncThunk<AuthPayload, LoginInput, RejectValue>(
  'auth/login',
  async (input, { rejectWithValue }) => {
    try {
      const payload = await authApi.login(input);
      setAccessToken(payload.accessToken);
      return payload;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const register = createAsyncThunk<AuthPayload, RegisterInput, RejectValue>(
  'auth/register',
  async (input, { rejectWithValue }) => {
    try {
      const payload = await authApi.register(input);
      setAccessToken(payload.accessToken);
      return payload;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk<void, void>('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    setAccessToken(null);
  }
});

export const updateProfile = createAsyncThunk<User, ProfileInput, RejectValue>(
  'auth/updateProfile',
  async (input, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(input);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const changePassword = createAsyncThunk<AuthPayload, PasswordInput, RejectValue>(
  'auth/changePassword',
  async (input, { rejectWithValue }) => {
    try {
      const payload = await authApi.updatePassword(input);
      setAccessToken(payload.accessToken);
      return payload;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    setSession(state, action: PayloadAction<AuthPayload>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.status = 'ready';
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.status = 'ready';
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'ready';
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'ready';
        state.user = null;
        state.accessToken = null;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'ready';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Could not log in';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'ready';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload ?? 'Could not create the account';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.status = 'ready';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      });
  },
});

export const { setUser, setSession, clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
