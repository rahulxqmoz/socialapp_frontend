import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../../config';



export const fetchBookmarkStatus = createAsyncThunk(
  'bookmarkPosts/fetchBookmarkStatus',
  async ({ posts, token }) => {
    const bookmarkPosts = {};
    for (let post of posts) {
      const response = await fetch(`${BASE_URL}/api/posts/${post.id}/check_bookmarked/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        bookmarkPosts[post.id] = result.bookmarked; // Assume the response contains { bookmarked: true/false }
      }
    }
    return bookmarkPosts;
  }
);



const bookmarkPostsSlice = createSlice({
  name: 'bookmarkPosts',
  initialState: {},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarkStatus.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      })
    
  },
});

export default bookmarkPostsSlice.reducer;
