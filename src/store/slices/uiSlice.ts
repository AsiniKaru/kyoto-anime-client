import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  mobileNavOpen: boolean;
}

const initialState: UiState = {
  mobileNavOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen;
    },
    setMobileNav(state, action: PayloadAction<boolean>) {
      state.mobileNavOpen = action.payload;
    },
    closeMobileNav(state) {
      state.mobileNavOpen = false;
    },
  },
});

export const { toggleMobileNav, setMobileNav, closeMobileNav } = uiSlice.actions;
export default uiSlice.reducer;
