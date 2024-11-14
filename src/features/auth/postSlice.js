import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { showSuccessToast } from '../../components/CustomToast';
import { showErrorToast } from '../../components/ErroToast';

// Thunk to fetch posts
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/?user_id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      showErrorToast('Error fetching posts');
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to fetch bookmarks
export const fetchBookmarks = createAsyncThunk(
  'posts/fetchBookmarks',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookmarks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.map(bookmark => bookmark.post);
    } catch (err) {
      showErrorToast('Error fetching bookmarks');
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const createNewPost = createAsyncThunk(
    'posts/createNewPost',
    async ({ postData, userId, token }, { rejectWithValue }) => {
      try {
        if (!postData.content || postData.content.trim() === '') {
          showErrorToast("Content cannot be empty.");
          return rejectWithValue("Content cannot be empty.");
        }
  
        const formData = new FormData();
        formData.append('content', postData.content);
        formData.append('user', userId);
  
        if (postData.image) {
          const imageBlob = await fetch(postData.image).then((res) => res.blob());
          formData.append('image', imageBlob, 'post.jpg');
        }
  
        if (postData.video) {
          const videoBlob = await fetch(postData.video).then((res) => res.blob());
          const videoSizeMB = videoBlob.size / (1024 * 1024);
          if (videoSizeMB > 100) {
            showErrorToast("Video size exceeds 100MB. Please upload a smaller file.");
            return rejectWithValue("Video size exceeds 100MB.");
          }
          formData.append('video', videoBlob, 'post.mp4');
        }
  
        formData.append('is_approved', true);
  
        const response = await axios.post(`${BASE_URL}/api/posts/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
  
        showSuccessToast("Post successfully submitted");
        return response.data;
      } catch (err) {
        showErrorToast("Error while submitting!");
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async ({ postId, token }, { rejectWithValue }) => {
      try {
        await axios.delete(`${BASE_URL}/api/posts/${postId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessToast('Post successfully deleted');
        return postId;
      } catch (err) {
        showErrorToast('Error deleting post');
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  export const editPost = createAsyncThunk(
    'posts/editPost',
    async ({ postId, postData, token }, { rejectWithValue }) => {
      try {
        const formData = new FormData();
        formData.append('content', postData.content);
  
        if (postData.image) {
          const imageBlob = await fetch(postData.image).then((res) => res.blob());
          formData.append('image', imageBlob, 'post.jpg');
        }
  
        if (postData.video) {
          const videoBlob = await fetch(postData.video).then((res) => res.blob());
          const videoSizeMB = videoBlob.size / (1024 * 1024);
          if (videoSizeMB > 100) {
            showErrorToast("Video size exceeds 100MB. Please upload a smaller file.");
            return rejectWithValue("Video size exceeds 100MB.");
          }
          formData.append('video', videoBlob, 'post.mp4');
        }
  
        const response = await axios.patch(`${BASE_URL}/api/posts/${postId}/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
  
        showSuccessToast("Post successfully updated");
        return response.data;
      } catch (err) {
        showErrorToast("Error while updating post!");
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  export const handleBookmark = createAsyncThunk(
    'bookmarkPosts/handleBookmark',
    async ({ postId, token, isBookmarked }, { dispatch }) => {
      if (isBookmarked) {
        // If already bookmarked, unbookmark the post
        await axios.delete(`${BASE_URL}/api/bookmarks/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessToast("Post Unmarked");
        return { postId, bookmarked: false };

      } else {
        // If not bookmarked, bookmark the post
        await axios.post(`${BASE_URL}/api/bookmarks/`, { post: postId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessToast("Post Bookmarked");
        return { postId, bookmarked: true };
      }
    }
  );
  
  export const handleLike = createAsyncThunk(
    'likedPosts/handleLike',
    async ({ postId, token ,userId}, { dispatch }) => {
      const response = await fetch(`${BASE_URL}/api/likes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId }),
      });
      //dispatch(fetchPosts({ userId, token }))
      if (response.status === 201) {
        showSuccessToast("Post Liked!");
        return { postId, liked: true };
        
      } else if (response.status === 204) {
        showSuccessToast("Post Unliked!");
        return { postId, liked: false };
        
      } else {
        throw new Error('Failed to like/unlike post');
      }
      
    }
  );

  export const viewPost = createAsyncThunk(
    'posts/viewPost',
    async ({ postId,token }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${BASE_URL}/api/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(`View:${response.data}`)
        return response.data;
      } catch (err) {
        showErrorToast('Error fetching posts');
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

// Posts slice to manage posts and bookmarks state
const postsSlice = createSlice({
    name: 'posts',
    initialState: {
      posts: [],
      currentPost: null,
      bookmarks: [],
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchPosts.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchPosts.fulfilled, (state, action) => {
          state.loading = false;
          state.posts = action.payload;
        })
        .addCase(fetchPosts.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        })
        .addCase(fetchBookmarks.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchBookmarks.fulfilled, (state, action) => {
          state.loading = false;
          state.bookmarks = action.payload;
        })
        .addCase(fetchBookmarks.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        })
        .addCase(createNewPost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(createNewPost.fulfilled, (state, action) => {
          state.loading = false;
          state.posts = [action.payload, ...state.posts];
        })
        .addCase(createNewPost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        })

          // Delete Post
        .addCase(deletePost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(deletePost.fulfilled, (state, action) => {
          state.loading = false;
          state.posts = state.posts.filter(post => post.id !== action.payload);
        })
        .addCase(deletePost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        })

        // Edit Post
        .addCase(editPost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(editPost.fulfilled, (state, action) => {
          state.loading = false;
          state.posts = state.posts.map(post =>
            post.id === action.payload.id ? action.payload : post
          );
        })
        .addCase(editPost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        })

        .addCase(handleBookmark.fulfilled, (state, action) => {
          const { postId, bookmarked } = action.payload;
          const postIndex = state.posts.findIndex(post => post.id === postId);
          if (postIndex !== -1) {
            state.posts[postIndex].bookmarked = bookmarked;
          }
          if (state.currentPost && state.currentPost.id === postId) {
            state.currentPost.bookmarked = bookmarked;
          }
        })

        .addCase(handleLike.fulfilled, (state, action) => {
          const { postId, liked  } = action.payload;
          const postIndex = state.posts.findIndex(post => post.id === action.payload.postId);
          if (postIndex !== -1) {
            state.posts[postIndex].liked = action.payload.liked;
            state.posts[postIndex].total_likes += action.payload.liked ? 1 : -1;
          }
          if (state.currentPost && state.currentPost.id === postId) {
            state.currentPost.liked = liked;
            state.currentPost.total_likes += liked ? 1 : -1;
          }
        })

        .addCase(viewPost.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(viewPost.fulfilled, (state, action) => {
          state.loading = false;
          state.currentPost = action.payload;
        })
        .addCase(viewPost.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
    },  
  });
  
 
  

export default postsSlice.reducer;
