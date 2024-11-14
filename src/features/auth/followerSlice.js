import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';

// Async thunk to fetch followers
export const fetchFollowers = createAsyncThunk(
  'followers/fetchFollowers',
  async ({ userId, token ,followertype}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/interactions/connections/?user_id=${userId}&type=${followertype}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // returning the data as the payload
    } catch (error) {
      return rejectWithValue(error.response.data); // returning error as rejected payload
    }
  }
);

const followersSlice = createSlice({
  name: 'followers',
  initialState: {
    followers: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Define other actions if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.loading = false;
        state.followers = action.payload; // update the followers state
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message; // handle error
      });
  },
});

export const { actions } = followersSlice;
export default followersSlice.reducer;
