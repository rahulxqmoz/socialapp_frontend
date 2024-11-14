
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../config';



export const fetchLikeStatus = createAsyncThunk(
  'likedPosts/fetchLikeStatus',
  async ({ posts, token }) => {
    const likeStatuses = {};
    for (let post of posts) {
      const response = await fetch(`${BASE_URL}/api/posts/${post.id}/check_liked/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        likeStatuses[post.id] = result.liked; // Assume the response contains { liked: true/false }
      }
    }
    return likeStatuses;
  }
);



const likedPostsSlice = createSlice({
  name: 'likedPosts',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikeStatus.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
      
  },
});

export default likedPostsSlice.reducer;
