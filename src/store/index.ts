import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearAuth, setSession } from './slices/authSlice';
import libraryReducer from './slices/librarySlice';
import type { AuthPayload } from '../types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    library: libraryReducer,
  },
});

// The Axios interceptor emits these events when it refreshes or loses a session.
if (typeof window !== 'undefined') {
  window.addEventListener('auth:refreshed', (event) => {
    const detail = (event as CustomEvent<AuthPayload>).detail;
    if (detail) store.dispatch(setSession(detail));
  });

  window.addEventListener('auth:expired', () => {
    store.dispatch(clearAuth());
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
