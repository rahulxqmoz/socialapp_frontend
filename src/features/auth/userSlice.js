import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null, // Load user from localStorage if available
  isAuthenticated: !!localStorage.getItem('token'), // Check token existence to set authentication status
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;

      localStorage.setItem('user', JSON.stringify(action.payload)); // Save user details to localStorage
    },
    updateUserProfileImage: (state, action) => {
      if (state.user) {
        state.user.profile_pic = action.payload; // Update the profile picture
        localStorage.setItem('user', JSON.stringify(state.user)); // Save updated user details to localStorage
      }
    },
    logout: (state) => {
      console.log("Inside logout reducer");
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem('user'); // Remove user details from localStorage on logout
      localStorage.removeItem('token'); // Clear token from localStorage
    },
  },
});

export const { setUser, logout,updateUserProfileImage } = userSlice.actions;
export const userReducer = userSlice.reducer;
