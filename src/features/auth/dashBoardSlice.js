import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';

// Thunks for fetching data
export const fetchWeeklyUserRegistration = createAsyncThunk(
  'dashboard/fetchWeeklyUserRegistration',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reports/reports/weekly_user_registration/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchEngagementStats = createAsyncThunk(
  'dashboard/fetchEngagementStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reports/reports/engagement_stats/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchWeeklyPostActivity = createAsyncThunk(
  'dashboard/fetchWeeklyPostActivity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reports/reports/weekly_post_activity/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    userRegistrationData: [],
    engagementData: {},
    postActivityData: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklyUserRegistration.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeeklyUserRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.userRegistrationData = action.payload;
      })
      .addCase(fetchWeeklyUserRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchEngagementStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEngagementStats.fulfilled, (state, action) => {
        state.loading = false;
        state.engagementData = action.payload;
      })
      .addCase(fetchEngagementStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWeeklyPostActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeeklyPostActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.postActivityData = action.payload;
      })
      .addCase(fetchWeeklyPostActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
