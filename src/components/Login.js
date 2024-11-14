import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess as authLoginSuccess } from '../features/auth/authSlice';
import { setUser, updateUserProfileImage } from '../features/auth/userSlice';
import logo from '../assets/logo.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import { showSuccessToast } from './CustomToast';
import { showErrorToast } from './ErroToast';
import { GoogleLogin } from '@react-oauth/google';
import ClipLoader from 'react-spinners/ClipLoader'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  
  

  useEffect(() => {
    if (user && token) {
      if (user.is_admin) {
        navigate('/admin/dashboard/reports_charts');
      } else {
        navigate('/home');
      }
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
 

  if (!trimmedEmail || !trimmedPassword) {
    showErrorToast('Email and password cannot be empty.');
    return;
  }
  setLoading(true);
 
    try {
      const response = await axios.post(`${BASE_URL}/api/users/login/`, {
        email: email,
        password: password,
      });

      const { token, id, username, first_name, profile_pic, is_admin,is_active,is_suspended } = response.data;
      console.log(response.data)
     
      if (!is_active) {
        showErrorToast('Your account is inactive. Please contact support.');
        setLoading(false); 
        return;    
      }
      if (is_suspended) {
        showErrorToast('Your account is suspended. Please contact support.');
        setLoading(false); 
        return;    
      }

      // Dispatch actions to update auth and user state
      dispatch(authLoginSuccess({ token }));
      dispatch(setUser({ id, username, first_name, profile_pic, is_admin,is_active }));

      showSuccessToast('Login successful!');

      if (is_admin) {
        dispatch(authLoginSuccess({ token }));
        dispatch(setUser({ id, username, first_name, profile_pic, is_admin,is_active }));
        navigate('/admin/dashboard/reports_charts'); 
      } else {
        setTimeout(() => {
          navigate('/home');
        }, 200); 
      }
    } catch (error) {
      console.error('Error logging in:', error.response?.data || error.message);
      if (error.response && error.response.status === 400) {
        showErrorToast('Invalid username or password!');
      } else {
        showErrorToast('Error logging in. Please try again.');
      }
    }finally {
      setLoading(false); // Stop loading
    }
  }
  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    try {
      const { credential } = response;
      // Send the token to your backend
      const result = await axios.post(`${BASE_URL}/api/users/google-signup/`, { token: credential });
      // Handle the response
      const { user, uidb64, token } = result.data;
      const {  id, username, first_name, profile_pic, is_admin,is_active  } = user;
      console.log(user)
      console.log(result.data)
      if (token) {
        dispatch(authLoginSuccess({ token }));
        dispatch(setUser({  id, username, first_name, profile_pic, is_admin,is_active}));
        dispatch(updateUserProfileImage(profile_pic));
        showSuccessToast('Login successful!');
        setTimeout(() => {
          navigate('/home');
        }, 1000); 
        // navigate(`/verification-waiting/${uidb64}/${token}/`);
        console.log("Google Register successfull");
      } else {
        showErrorToast('Verification data missing. Please try again.');
      }
    } catch (error) {
      console.error('Google signup error:', error.response?.data || error.message);
      showErrorToast('Error signing up with Google. Please try again.');
    }finally {
      setLoading(false); // Stop loading
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login error:', error);
    showErrorToast('Error with Google sign-in. Please try again.');
  };


  return ( 
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-indigo-600">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 p-8 bg-white rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-2">
          {/* Logo Image */}
          <img
            src={logo} // Replace with your image path or URL
            alt="Logo"
            className="w-20 h-20 mb-1"
          />
          {/* App Name */}
          <h1 className="text-3xl font-semibold text-gray-800">Connectify</h1>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" disabled={loading}
        >
           {loading ? <ClipLoader color="#fff" size={20} /> : 'Login'}
        </button>
        <div className="flex justify-center mt-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
        />
      </div>
        <div className="flex justify-between text-sm text-gray-600">
          <a href="/password-reset-request" className="hover:text-blue-500">Forgot password?</a>
          <a href="/signup" className="hover:text-blue-500">Sign up</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
