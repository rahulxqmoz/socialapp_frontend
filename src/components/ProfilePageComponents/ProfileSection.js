import React from 'react'
import { FaEdit, FaUser } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import ProfileStats from '../ProfileStats'

const ProfileSection=({user, profile,followerCount,followingCount})=> {
  return (
   <div>
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
    {/* User Info */}
    <div className="text-center sm:text-left flex items-center space-x-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold">{profile.first_name}</h2>
        <h2 className="text-sm text-teal-800 opacity-75 shadow-sm">{`@${profile.username}`}</h2>
      </div>
      
      {/* Profile and Edit Icons */}
      <div className="flex space-x-2 ml-4">
        {/* Profile Icon Link */}
        <Link
          to="/profile-detail"
          className="text-blue-500 hover:text-blue-700"
          title="Profile"
        >
          <FaUser className="text-xl" />
        </Link>
  
        {/* Edit Profile Icon Link */}
        <Link
          to="/edit-profile"
          className="text-blue-500 hover:text-blue-700"
          title="Edit Profile"
        >
          <FaEdit className="text-xl" />
        </Link>
      </div>
  
    <ProfileStats userId={user.id} followerCount={followerCount} followingCount={followingCount}/>
    </div>
  </div>
  
      {/* Bio Section */}
      <div>
     <p className="text-gray-600 mb-6 text-center sm:text-left">
    {profile.bio || 'No bio available'}
  </p>
  </div>
  </div>
  )
}

export default ProfileSection
