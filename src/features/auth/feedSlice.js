import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'; 
import axios from 'axios';
import { BASE_URL } from '../../config';
import { showSuccessToast } from '../../components/CustomToast';
import { showErrorToast } from '../../components/ErroToast';

// Updated to accept page parameter
export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async ({ token, page }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/interactions/feed/?page=${page}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { posts: response.data, page };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePostLikes = createAsyncThunk(
  'feed/updatePostLikes',
  async ({ postId, token, userId }, { dispatch }) => {
    const response = await axios.post(`${BASE_URL}/api/likes/`, {
      post: postId,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(fetchFeed({ token, userId }));
    if (response.status === 201) {
      showSuccessToast("Post Liked!");
      return { postId, liked: true };
    } else if (response.status === 204) {
      showSuccessToast("Post Uniked!");
      return { postId, liked: false };
    } else {
      throw new Error('Failed to like/unlike post');
    }
  }
);

export const updatePostBookmarks = createAsyncThunk(
  'feed/updatePostBookmarks',
  async ({ postId, token, isBookmarked }, { dispatch }) => {
    if (isBookmarked) {
      // If already bookmarked, unbookmark the post
      await axios.delete(`${BASE_URL}/api/bookmarks/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccessToast("Post Unmarked!");
      return { postId, bookmarked: false };
    } else {
      // If not bookmarked, bookmark the post
      await axios.post(`${BASE_URL}/api/bookmarks/`, { post: postId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showSuccessToast("Post Bookmarked!");
      return { postId, bookmarked: true };
    }
  }
);
export const reportPost = createAsyncThunk(
  'feed/reportPost',
  async ({ post, reason, additional_info, reported_by,token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/reports/`,
        {
          post,
          reason,          
          additional_info,  
          reported_by
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showSuccessToast('Post Reported!!')
      return response.data;
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        
        
        showErrorToast('You have already reported this data')
      } else {
        console.error(error);
      }
      
      return rejectWithValue(error.response.data);
    }
  }
);
const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    hasMore: true,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { posts, page } = action.payload;
        state.loading = false;
        state.error = null;

        if (page === 1) {
          // Replace posts if it's the first page
          state.posts = posts;
        } else {
          // Append posts for subsequent pages
          state.posts = [...state.posts, ...posts];
        }

        // Determine if there are more posts to load
        state.hasMore = posts.length > 0;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(updatePostLikes.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(post => post.id === action.payload.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].liked = action.payload.liked;
          state.posts[postIndex].total_likes += action.payload.liked ? 1 : -1;
        }
      })
      .addCase(updatePostBookmarks.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(post => post.id === action.payload.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].bookmarked = action.payload.bookmarked;
        }
      })
      .addCase(reportPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(reportPost.fulfilled, (state, action) => {
        state.loading = false;
      
      })
     
  },
});




export default feedSlice.reducer;
