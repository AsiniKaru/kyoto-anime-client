import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { libraryApi } from '../../api/library';
import { apiErrorMessage } from '../../api/client';
import type {
  HistoryEntry,
  HistoryPayload,
  LibraryStats,
  WatchStatus,
  WatchlistEntry,
  WatchlistPayload,
} from '../../types';
import { logout } from './authSlice';

interface LibraryState {
  watchlist: WatchlistEntry[];
  history: HistoryEntry[];
  stats: LibraryStats | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: LibraryState = {
  watchlist: [],
  history: [],
  stats: null,
  status: 'idle',
  error: null,
};

interface RejectValue {
  rejectValue: string;
}

export const fetchLibrary = createAsyncThunk<
  { watchlist: WatchlistEntry[]; history: HistoryEntry[]; stats: LibraryStats },
  void,
  RejectValue
>('library/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [watchlist, history, stats] = await Promise.all([
      libraryApi.getWatchlist(),
      libraryApi.getHistory(),
      libraryApi.getStats(),
    ]);

    return {
      watchlist: watchlist.data,
      history: history.data,
      stats: stats.data,
    };
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const addToWatchlist = createAsyncThunk<
  WatchlistEntry,
  WatchlistPayload,
  RejectValue
>('library/add', async (payload, { rejectWithValue }) => {
  try {
    const response = await libraryApi.addToWatchlist(payload);
    return response.data;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const updateWatchlistStatus = createAsyncThunk<
  WatchlistEntry,
  { malId: number; status: WatchStatus },
  RejectValue
>('library/updateStatus', async ({ malId, status }, { rejectWithValue }) => {
  try {
    const response = await libraryApi.updateWatchlistStatus(malId, status);
    return response.data;
  } catch (error) {
    return rejectWithValue(apiErrorMessage(error));
  }
});

export const removeFromWatchlist = createAsyncThunk<number, number, RejectValue>(
  'library/remove',
  async (malId, { rejectWithValue }) => {
    try {
      await libraryApi.removeFromWatchlist(malId);
      return malId;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const saveProgress = createAsyncThunk<HistoryEntry, HistoryPayload, RejectValue>(
  'library/saveProgress',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await libraryApi.saveProgress(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const removeHistoryEntry = createAsyncThunk<number, number, RejectValue>(
  'library/removeHistory',
  async (malId, { rejectWithValue }) => {
    try {
      await libraryApi.removeHistoryEntry(malId);
      return malId;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const clearHistory = createAsyncThunk<void, void, RejectValue>(
  'library/clearHistory',
  async (_, { rejectWithValue }) => {
    try {
      await libraryApi.clearHistory();
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    resetLibrary(state) {
      state.watchlist = [];
      state.history = [];
      state.stats = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibrary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.status = 'ready';
        state.watchlist = action.payload.watchlist;
        state.history = action.payload.history;
        state.stats = action.payload.stats;
      })
      .addCase(fetchLibrary.rejected, (state, action) => {
        state.status = 'ready';
        state.error = action.payload ?? 'Could not load your library';
      })
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        const index = state.watchlist.findIndex((entry) => entry.malId === action.payload.malId);
        if (index >= 0) state.watchlist[index] = action.payload;
        else state.watchlist.unshift(action.payload);
        if (state.stats) {
          state.stats.watchlistTotal = state.watchlist.length;
        }
      })
      .addCase(updateWatchlistStatus.fulfilled, (state, action) => {
        const index = state.watchlist.findIndex((entry) => entry.malId === action.payload.malId);
        if (index >= 0) state.watchlist[index] = action.payload;
      })
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter((entry) => entry.malId !== action.payload);
        if (state.stats) state.stats.watchlistTotal = state.watchlist.length;
      })
      .addCase(saveProgress.fulfilled, (state, action) => {
        const index = state.history.findIndex((entry) => entry.malId === action.payload.malId);
        if (index >= 0) state.history[index] = action.payload;
        else state.history.unshift(action.payload);
      })
      .addCase(removeHistoryEntry.fulfilled, (state, action) => {
        state.history = state.history.filter((entry) => entry.malId !== action.payload);
      })
      .addCase(clearHistory.fulfilled, (state) => {
        state.history = [];
      })
      .addCase(logout.fulfilled, (state) => {
        state.watchlist = [];
        state.history = [];
        state.stats = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { resetLibrary } = librarySlice.actions;
export default librarySlice.reducer;
