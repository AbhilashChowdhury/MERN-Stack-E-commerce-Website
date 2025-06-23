import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  favorites: [],
  loading: false,
  error: null,
};

// Async thunk to fetch favorites from backend
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.get(`/api/favorites/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to add favorite to backend
export const addFavoriteToBackend = createAsyncThunk(
  "favorites/addFavoriteToBackend",
  async ({ userId, productId }, thunkAPI) => {
    try {
      const response = await axios.post(`/api/favorites/${userId}`, { productId });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to remove favorite from backend
export const removeFavoriteFromBackend = createAsyncThunk(
  "favorites/removeFavoriteFromBackend",
  async ({ userId, productId }, thunkAPI) => {
    try {
      await axios.delete(`/api/favorites/${userId}/${productId}`);
      return productId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    // Local reducer to add favorite (without backend call)
    addToFavorites: (state, action) => {
      const item = action.payload;
      if (!state.favorites.some((fav) => fav._id === item._id)) {
        state.favorites.push(item);
      }
    },
    // Local reducer to remove favorite (without backend call)
    removeFromFavorites: (state, action) => {
      const item = action.payload;
      state.favorites = state.favorites.filter((fav) => fav._id !== item._id);
    },
    // Set favorites (e.g., from localStorage)
    setFavorites: (state, action) => {
      state.favorites = action.payload || [];
    },
    // Clear all favorites
    clearFavorites: (state) => {
      state.favorites = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addFavoriteToBackend.fulfilled, (state, action) => {
        const item = action.payload;
        if (!state.favorites.some((fav) => fav._id === item._id)) {
          state.favorites.push(item);
        }
      })
      .addCase(removeFavoriteFromBackend.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter((fav) => fav._id !== action.payload);
      });
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
  clearFavorites,
} = favoriteSlice.actions;

export const selectFavoriteProduct = (state) => state.favorites.favorites;

export default favoriteSlice.reducer;
