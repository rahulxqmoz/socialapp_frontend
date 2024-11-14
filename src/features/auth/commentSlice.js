import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { showSuccessToast } from '../../components/CustomToast';
import { showErrorToast } from '../../components/ErroToast';

// Async thunk to fetch comments for a post
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async ({ postId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/${postId}/comments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { postId, comments: response.data };
    } catch (error) {
      return rejectWithValue('Error fetching comments');
    }
  }
);

// Async thunk to handle submitting a comment
export const handleSubmitComment = createAsyncThunk(
  'comments/handleSubmitComment',
  async ({ postId, commentText, userId, parentId, token }, { dispatch, rejectWithValue }) => {
    if (!commentText.trim()) {
      showErrorToast('Empty Comment Box');
      return rejectWithValue('Empty comment');
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/comments/`,
        {
          post: postId,
          content: commentText,
          user: userId,
          parent: parentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newCommentData = response.data;
      dispatch(addComment({ postId, newComment: newCommentData }));
      showSuccessToast('Comment submitted successfully');
    } catch (error) {
      showErrorToast('Error submitting comment');
      return rejectWithValue('Error submitting comment');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    commentsByPostId: {},
    loading: false,
    error: null,
  },
  reducers: {
    addComment: (state, action) => {
      const { postId, newComment } = action.payload;
      if (state.commentsByPostId[postId]) {
        state.commentsByPostId[postId].push(newComment);
      } else {
        state.commentsByPostId[postId] = [newComment];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload;
        state.commentsByPostId[postId] = comments;
        state.loading = false;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(handleSubmitComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { addComment } = commentsSlice.actions;

export default commentsSlice.reducer;
