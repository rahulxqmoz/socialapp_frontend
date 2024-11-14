import { createSlice } from '@reduxjs/toolkit';
import { logout } from './userSlice';


const initialState = {
  token: localStorage.getItem('token') || null, // Load token from localStorage
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { token } = action.payload;
      state.token = token;
      localStorage.setItem('token', token); // Store token in localStorage
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.token = null;
      localStorage.removeItem('token'); // Clear token from localStorage on logout
    });
  },
});

export const { loginSuccess } = authSlice.actions;
export const authReducer = authSlice.reducer;
