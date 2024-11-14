import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { BASE_URL } from '../config';
import { showErrorToast } from '../components/ErroToast';
import { showSuccessToast } from '../components/CustomToast';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/userSlice';
import BioField from '../components/BioField';

const EditProfilePage = () => {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [originalData, setOriginalData] = useState({});
  const [profileData, setProfileData] = useState({
    username: '',
    first_name: '',
    email: '',
    bio: '',
    dob: '',
    mobile: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({
    profile: {},
    password: {},
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/profile/${user?.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
        setOriginalData(response.data); // Save original data
      } catch (err) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          profile: { message: 'An error occurred while fetching the profile.' },
        }));
      }
    };

    if (user && token) fetchProfile();
  }, [user, token]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const validateProfile = () => {
    const errors = {};

    // Username validation
    if (!profileData.username.trim()) {
      errors.username = 'Username cannot be empty or just spaces';
    }

    // First Name validation
    if (!profileData.first_name.trim()) {
      errors.first_name = 'First Name cannot be empty or just spaces';
    }

    // Date of Birth validation (Age must be 18 or above)
    const userDob = new Date(profileData.dob);
    const age = new Date().getFullYear() - userDob.getFullYear();
    if (!profileData.dob) {
      errors.dob = 'Date of birth is required';
    } else if (age < 18) {
      errors.dob = 'You must be at least 18 years old';
    }

    // Mobile number validation (Indian format)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!profileData.mobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!mobileRegex.test(profileData.mobile)) {
      errors.mobile = 'Invalid mobile number';
    }

    return errors;
  };

  const validatePassword = () => {
    const errors = {};

    // Current Password validation
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }

    // New Password validation (strong password)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (!passwordRegex.test(passwordData.new_password)) {
      errors.new_password =
        'New password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    // Confirm password validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    return errors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    // Validate profile data
    const profileErrors = validateProfile();
    if (Object.keys(profileErrors).length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, profile: profileErrors }));
      return;
    }

    // Filter out only changed fields
    const changedData = Object.keys(profileData).reduce((acc, key) => {
      if (profileData[key] !== originalData[key]) {
        acc[key] = profileData[key];
      }
      return acc;
    }, {});

    if (Object.keys(changedData).length === 0) {
      showErrorToast('No changes detected.');
      return;
    }

    try {
      await axios.patch(`${BASE_URL}/api/users/profile/update/`, changedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccessToast('Profile updated successfully!');
      setOriginalData(profileData);
     
      setTimeout(() => {
        navigate('/profile-detail')
      }, 1000);
    } catch (err) {
      if (err.response?.data?.detail === 'Username already exists.') {
        setErrors((prevErrors) => ({
          ...prevErrors,
          profile: { username: 'Username already exists.' },
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          profile: { message: 'An error occurred while updating the profile.' },
        }));
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate password data
    const passwordErrors = validatePassword();
    if (Object.keys(passwordErrors).length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, password: passwordErrors }));
      return;
    }

    try {
      await axios.patch(`${BASE_URL}/api/users/password/update/`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccessToast('Password updated successfully!Please Login again!');
      dispatch(logout())
      setTimeout(() => {
        navigate('/login')
      }, 2000);
    } catch (err) {
      // Handle API error responses
      if (err.response?.data?.detail) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: { message: err.response.data.detail },
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: { message: 'An error occurred while updating the password.' },
        }));
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Edit Profile</h2>
        <Link to="/profile" className="text-blue-500 hover:text-blue-700">
          Back
        </Link>
      </div>

      {errors.profile.message && (
        <div className="text-red-500 text-center mb-4">{errors.profile.message}</div>
      )}

      {/* Profile Update Form */}
      <form onSubmit={handleProfileSubmit} className="mb-8">
        {/* Username Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={profileData.username}
            onChange={handleProfileChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.profile.username && (
            <div className="text-red-500 text-sm">{errors.profile.username}</div>
          )}
        </div>

        {/* First Name Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="first_name"
            value={profileData.first_name}
            onChange={handleProfileChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.profile.first_name && (
            <div className="text-red-500 text-sm">{errors.profile.first_name}</div>
          )}
        </div>

        {/* Email Field (Read Only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            readOnly
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Bio Field */}
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={profileData.bio}
            onChange={handleProfileChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
        </div> */}
        <BioField 
        bio={profileData.bio}
        handleProfileChange={handleProfileChange}
      />

        {/* Date of Birth Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={profileData.dob}
            onChange={handleProfileChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.profile.dob && (
            <div className="text-red-500 text-sm">{errors.profile.dob}</div>
          )}
        </div>

        {/* Mobile Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={profileData.mobile}
            onChange={handleProfileChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.profile.mobile && (
            <div className="text-red-500 text-sm">{errors.profile.mobile}</div>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Update Profile
        </button>
      </form>

      {/* Password Update Form */}
      <form onSubmit={handlePasswordSubmit}>
        {errors.password.message && (
          <div className="text-red-500 text-center mb-4">{errors.password.message}</div>
        )}

        {/* Current Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={passwordData.current_password}
            onChange={handlePasswordChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.password.current_password && (
            <div className="text-red-500 text-sm">{errors.password.current_password}</div>
          )}
        </div>

        {/* New Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            name="new_password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.password.new_password && (
            <div className="text-red-500 text-sm">{errors.password.new_password}</div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            name="confirm_password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {errors.password.confirm_password && (
            <div className="text-red-500 text-sm">{errors.password.confirm_password}</div>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
