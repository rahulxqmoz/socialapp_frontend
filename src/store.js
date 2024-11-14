
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import { authReducer } from './features/auth/authSlice';
import { userReducer } from './features/auth/userSlice';

import suggestionSlice from './features/auth/suggestionSlice';
import profileSlice from './features/auth/profileSlice';
import postSlice from './features/auth/postSlice';
import commentSlice from './features/auth/commentSlice';
import likeSlice from './features/auth/likeSlice';
import bookmarkSlice from './features/auth/bookmarkSlice';
import feedSlice from './features/auth/feedSlice';
import notificationSlice from './features/auth/notificationSlice';
import followersSlice from './features/auth/followerSlice'
import chatSlice from './features/auth/chatSlice'
import announcementSlice from './features/auth/announcementSlice'
import adminPostsSlice from './features/auth/adminPostSlice'
import groupChatSlice from './features/auth/groupChatSlice'
import dashboardSlice from './features/auth/dashBoardSlice'
import callSlice from './features/auth/callSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    profile: profileSlice,
    suggestions:suggestionSlice,
    posts:postSlice,
    comments:commentSlice,
    likedPosts:likeSlice,
    bookmarkPosts: bookmarkSlice,
    feed:feedSlice,
    notifications:notificationSlice,
    followers:followersSlice,
    chat:chatSlice,
    announcement: announcementSlice,
    adminPosts:adminPostsSlice,
    groupChat:groupChatSlice,
    dashboard:dashboardSlice,
    call:callSlice,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunk),
});

export default store;
