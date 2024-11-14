import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';

// Thunk to fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/notifications/notifications/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async ({ notificationId, token }, { rejectWithValue }) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/notifications/notifications/${notificationId}/`,
        { is_read: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
      notifications: [],
      loading: false,
      error: null,
    },
    reducers: {
      updateNotificationReadStatus(state, action) {
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification) {
          notification.is_read = true;
        }
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchNotifications.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchNotifications.fulfilled, (state, action) => {
          state.loading = false;
          state.notifications = action.payload;
        })
        .addCase(fetchNotifications.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
    },
  });
  
  export default notificationSlice.reducer;
  