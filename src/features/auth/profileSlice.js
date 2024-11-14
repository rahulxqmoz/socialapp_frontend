import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { showErrorToast } from '../../components/ErroToast';
import { showSuccessToast } from '../../components/CustomToast';
import { updateUserProfileImage } from './userSlice';

// Thunks for asynchronous actions
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/profile/${userId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        showErrorToast('Session timed out! Please login again.');
      } else {
        showErrorToast('An error occurred while fetching the profile.');
      }
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const followUnfollowUser = createAsyncThunk(
  'profile/followUnfollowUser',
  async ({ userId, token, currentUser, isFollowing }, { rejectWithValue }) => {
    try {
      if (!isFollowing) {
        await axios.post(`${BASE_URL}/api/interactions/follow/${userId}/`, { follower_id: currentUser }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessToast('Followed successfully');
        return { userId, isFollowing: true };
      } else {
        await axios.post(`${BASE_URL}/api/interactions/unfollow/${userId}/`, { follower_id: currentUser }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        showSuccessToast('Unfollowed successfully');
        return { userId, isFollowing: false };
      }
    } catch (err) {
      showErrorToast('Error in follow/unfollow action');
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
export const uploadProfileImage = createAsyncThunk(
    'profile/uploadProfileImage',
    async ({ imageBlob, imageType, token, userId }, { dispatch, rejectWithValue }) => {
      const formData = new FormData();
      formData.append(imageType === 'cover' ? 'cover_pic' : 'profile_pic', imageBlob, 'cropped-image.jpg');
  
      try {
        const response = await axios.patch(`${BASE_URL}/api/users/profile/update/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // After successfully uploading the image, re-fetch the profile
        dispatch(fetchProfile({ userId, token }));
        

      // Dispatch an action to update the user profile image in the state if it's a profile image
      if (imageType === 'profile') {
        dispatch(updateUserProfileImage(response.data.profile_pic));
      }
       
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    isFollowing: false,
    followerCount: 0,
    followingCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.followerCount = action.payload.followers;
        state.followingCount = action.payload.following;
        state.isFollowing = action.payload.is_following;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(followUnfollowUser.fulfilled, (state, action) => {
        state.isFollowing = action.payload.isFollowing;
        state.followerCount += action.payload.isFollowing ? 1 : -1;
      })
      .addCase(followUnfollowUser.rejected, (state, action) => {
        state.error = action.payload.message;
      });
  },
});

export default profileSlice.reducer;
