import React from 'react';
//import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import store from './store';
import { Provider } from 'react-redux';
import SignupPage from './pages/SignupPage';
import Layout from './layouts/Layouts';
import { ToastContainer } from 'react-toastify';
import VerificationWaitingPage from './pages/VerificationWaitingPage';
import AdminDashboard from './admin/dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PasswordResetRequest from './components/PasswordResetRequest';
import PasswordReset from './components/PasswordReset';
import AdminUserList from './admin/AdminUserList';
import EditProfilePage from './pages/EditProfilePage';
import ProfileDetailsPage from './pages/ProfileDetailsPage'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from './config';
import UserProfilePage from './pages/ProfileView';
import Followers from './pages/Followers';
import Following from './pages/Following';
import BookmarksPage from './pages/BookmarksPage';
import ProfilePage from './pages/ProfilePage';
import SuggestionList from './pages/SuggestionPage';
import FeedPage from './pages/FeedPage';
import AllNotificationsPage from './pages/NotificationPage';
import ViewPostPage from './pages/ViewPostPage';
import ChatDialogMessage from './pages/ChatDialogMessage';
import AdminPosts from './admin/AdminReportPosts';
import ListGroupsPage from './pages/ListGroupsPage';
import GroupChatBox from './pages/GroupChatBox';
import VideoCall from './pages/VideoCallPage';
import AdminDashboardReports from './admin/AdminDashboard';
import AdminAnnouncementPage from './admin/AdminAnnouncementPage';


function App() {
  
  return (  

    <Provider store={store}>
     <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Router>
      <ToastContainer/>
   
        <Routes>
        <Route path="/" element={<Layout />}>
        <Route path="/profile" element={<ProfilePage />} >
        

        </Route>
        <Route path="/home" element={<FeedPage />} />
        
        <Route path="/followers/:userId" element={<Followers />} />
        <Route path="/following/:userId" element={<Following />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/profile-detail" element={<ProfileDetailsPage />} />
        <Route path="/profileview/:id" element={<UserProfilePage />} />
        <Route path="/see-all" element={<SuggestionList />} />
        <Route path="/notifications" element={<AllNotificationsPage />} />
        <Route path="/viewpost/:postId" element={<ViewPostPage />} />
        <Route path="/messages" element={<ChatDialogMessage />} />
        <Route path="/groupchat" element={<ListGroupsPage />}> 
        </Route>
        <Route path="/chat/:roomId" element={<GroupChatBox />} />
        <Route path="/video-call/:userId" element={<VideoCall />} />
        </Route>
        <Route path="/login" element={<Login />} />
       
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verification-waiting/:uidb64/:token" element={<VerificationWaitingPage />} />
        <Route
            path="/admin/dashboard/"
            element={
              <ProtectedRoute isAdminRoute={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          > 
            <Route path="users" element={<AdminUserList />} />
            <Route path="announcement" element={<AdminAnnouncementPage />} />
            <Route path="reports" element={<AdminPosts />} />
            <Route path="reports_charts" element={<AdminDashboardReports />} />
            </Route>
           <Route path="/password-reset-request" element={<PasswordResetRequest />} />
           <Route path="/password-reset/:uidb64/:token" element={<PasswordReset />} />
        </Routes>
       
    </Router>
    </GoogleOAuthProvider>
</Provider>


    
  );
}

export default App;
