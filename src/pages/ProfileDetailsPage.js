import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../config';
import { showErrorToast } from '../components/ErroToast';
import { Link } from 'react-router-dom';

const ProfileDetailsPage = () => {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);

  const [profileData, setProfileData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/users/profile/${user?.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
      } catch (err) {
        setError('An error occurred while fetching the profile.');
        showErrorToast('An error occurred while fetching the profile.');
      }
    };

    if (user && token) fetchProfile();
  }, [user, token]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-3xl font-semibold text-gray-800">Profile Details</h2>
      <Link to="/profile" className="text-blue-500 hover:text-blue-700 text-lg">
        Back
      </Link>
    </div>

    {error && (
      <div className="text-red-500 text-center mb-4">{error}</div>
    )}

    {/* Profile Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Username Field */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Username</h3>
        <p className="text-gray-600 mt-2">{profileData.username}</p>
      </div>

      {/* First Name Field */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">First Name</h3>
        <p className="text-gray-600 mt-2">{profileData.first_name}</p>
      </div>

      {/* Email Field */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Email</h3>
        <p className="text-gray-600 mt-2">{profileData.email}</p>
      </div>

      {/* Bio Field */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md col-span-1 md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-700">Bio</h3>
        <p className="text-gray-600 mt-2">{profileData.bio}</p>
      </div>

      {/* Date of Birth Field */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Date of Birth</h3>
        <p className="text-gray-600 mt-2">{profileData.dob}</p>
      </div>

      {/* Mobile Number Field */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700">Mobile Number</h3>
        <p className="text-gray-600 mt-2">{profileData.mobile}</p>
      </div>
    </div>
  </div>
  );
};

export default ProfileDetailsPage;
