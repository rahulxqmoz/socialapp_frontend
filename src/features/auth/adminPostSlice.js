import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { showSuccessToast } from '../../components/CustomToast';
import { showErrorToast } from '../../components/ErroToast';

// Thunk to fetch reported posts
export const fetchReportedPosts = createAsyncThunk(
  'adminPosts/fetchReportedPosts',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/reported_posts/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      showErrorToast('Error fetching reported posts');
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const suspendPost = createAsyncThunk(
  'adminPosts/suspendPost',
  async ({ postId, report_reason,token }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/posts/${postId}/suspend_post/`, 
      {report_reason}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccessToast('Post suspended');
      // Refresh reported posts after suspending a post
      dispatch(fetchReportedPosts({ token }));
      return response.data;
    } catch (err) {
      showErrorToast('Error suspending post');
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to approve a post (remove suspension)
export const approvePost = createAsyncThunk(
  'adminPosts/approvePost',
  async ({ postId, token }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/posts/${postId}/approve_post/`, 
      {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccessToast('Post approved');
      // Refresh reported posts after approving a post
      dispatch(fetchReportedPosts({ token }));
      return response.data;
    } catch (err) {
      showErrorToast('Error approving post');
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const adminPostsSlice = createSlice({
    name: 'adminPosts',
    initialState: {
      reportedPosts: [],
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      // Fetch reported posts
      builder
        .addCase(fetchReportedPosts.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchReportedPosts.fulfilled, (state, action) => {
          state.loading = false;
          state.reportedPosts = action.payload;
        })
        .addCase(fetchReportedPosts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      // Suspend post
      builder
        .addCase(suspendPost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(suspendPost.fulfilled, (state, action) => {
          state.loading = false;
          //state.reportedPosts = state.reportedPosts.filter(post => post.id !== action.payload.id);
        })
        .addCase(suspendPost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      // Approve post
      builder
        .addCase(approvePost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(approvePost.fulfilled, (state, action) => {
          state.loading = false;
          //state.reportedPosts = state.reportedPosts.filter(post => post.id !== action.payload.id);
        })
        .addCase(approvePost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
    },
  });
  
  export default adminPostsSlice.reducer;
  