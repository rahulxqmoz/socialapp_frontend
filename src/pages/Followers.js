import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { followUnfollowUser } from '../features/auth/profileSlice';
import { fetchFollowers } from '../features/auth/followerSlice';
const Followers = () => {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const { userId } = useParams(); 
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const followers = useSelector((state) => state.followers.followers); // Fetch followers from state
  const loading = useSelector((state) => state.followers.loading); // Get loading state
  
 
  useEffect(() => {
    // Fetch followers when component loads
    if (token) {
      dispatch(fetchFollowers({ userId, token,followertype:'followers' }));
    }
  }, [token,user]);
  const checkUser=user.id



  const handleFollowUnfollow = (userId,isFollowing) => {
    dispatch(followUnfollowUser({ userId, token,currentUser:user.id , isFollowing }));
  };


  const filteredFollowers = followers.filter(follower =>
    follower.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-lg mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Followers</h1>
    <input
      type="text"
      placeholder="Search followers..."
      className="mb-4 p-2 w-full border border-gray-300 rounded-md"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  
    {loading ? (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    ) : filteredFollowers.length === 0 ? (
      <div className="text-center text-gray-500">No followers until now.</div>
    ) : (
      <ul className="space-y-4 p-2">
       {filteredFollowers.map((follower) => (
  <Link
    to={`/profileview/${follower.id}`}
    className="text-blue-500 hover:text-blue-700"
    title="Profile"
  >
    <li key={follower.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md mt-1">
      <div className="flex items-center space-x-4">
        <img src={follower.profile_pic || 'https://via.placeholder.com/800x500'} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        <span>{follower.username}</span>
      </div>
      {checkUser === follower.id ? (
        <div className="flex justify-end space-x-2">
          {/* No buttons visible for the logged in user */}
        </div>
      ) : (
        <div className="flex justify-end space-x-2">
          {follower.is_following ? (
            <button
              className="text-blue-500 border border-blue-500 px-4 py-1 rounded-md hover:bg-blue-500 hover:text-white disabled  w-24"
            >
              Following
            </button>
          ) : (
            <button
              onClick={() => handleFollowUnfollow(follower.id, follower.is_following)}
              className="text-blue-500 border border-blue-500 px-4 py-1 rounded-md hover:bg-blue-500 hover:text-white  w-24"
            >
              Follow
            </button>
          )}
   
        </div>
      )}
    </li>
  </Link>
))}
      </ul>
    )}
  </div>
  );
};

export default Followers;
