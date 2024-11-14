import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';



// Async thunk to create an announcement
export const createAnnouncement = createAsyncThunk(
  'announcement/createAnnouncement',
  async ({ content, token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/notifications/admin/announcement/`,
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      //showSuccessToast('Announcement Created!');
      return response.data;
     
    } catch (err) {
        //showErrorToast('Error submitting announcement')
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const announcementSlice = createSlice({
  name: 'announcement',
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetAnnouncementState(state) {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAnnouncement.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createAnnouncement.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createAnnouncement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAnnouncementState } = announcementSlice.actions;
export default announcementSlice.reducer;
