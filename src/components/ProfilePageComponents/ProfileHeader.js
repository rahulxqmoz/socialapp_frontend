import React from 'react';
import { FaCamera } from 'react-icons/fa';

const ProfileHeader = ({ profile, handleFileChange, openModal }) => {
  return (
    <div
    className="relative h-48 sm:h-60 bg-cover bg-center cursor-pointer"
    style={{ backgroundImage: `url(${profile.cover_pic || 'https://via.placeholder.com/800x500'})` }}
  >
    <label
      htmlFor="cover-upload"
      className="absolute top-2 right-2 sm:top-4 sm:right-4 cursor-pointer bg-white p-1 rounded-full shadow-lg hover:bg-gray-100"
    >
      <FaCamera className="text-gray-600 text-lg" />
    </label>
    <input
      id="cover-upload"
      type="file"
      accept="image/*"
      onChange={(e) => handleFileChange(e, 'cover')}
      className="hidden"
    />
    <button
      onClick={() => openModal('cover')}
      className="absolute top-2 right-12 sm:top-4 sm:right-12 bg-blue-500 text-white px-2 py-1 rounded-full shadow-lg hover:bg-blue-600"
    >
      Upload
    </button>

    {/* Profile Picture */}
    <div className="absolute bottom-0 left-2 sm:left-4 transform -translate-y-1/2">
      <div className="relative">
        <img
          src={profile.profile_pic || 'https://via.placeholder.com/100'}
          alt="Profile"
          accept="image/*"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md cursor-pointer object-cover"
          onClick={() => openModal('profile')}
        />
        <label
          htmlFor="profile-upload"
          className="absolute bottom-1 left-10 sm:left-12 cursor-pointer bg-white p-1 rounded-full shadow-lg hover:bg-gray-100"
        >
          <FaCamera className="text-gray-600 text-lg" />
        </label>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'profile')}
          className="hidden"
        />
        <button
          onClick={() => openModal('profile')}
          className="absolute bottom-1 left-16 sm:left-24 bg-blue-500 text-white px-2 py-1 rounded-full shadow-lg hover:bg-blue-600"
        >
          Upload
        </button>
      </div>
    </div>
  </div>
  );
};

export default ProfileHeader;