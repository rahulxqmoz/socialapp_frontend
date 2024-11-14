import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProfile, followUnfollowUser } from '../features/auth/profileSlice';
import { fetchSuggestions } from '../features/auth/suggestionSlice';

const Suggestion = ({ suggestions }) => {
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState({}); // Define a state variable to keep track of whether the user is following the suggestion or not

  const limitedSuggestions = suggestions.slice(0, 6);

  const handleFollowUnfollow = (userId) => {
    const isUserFollowing = followingUsers.includes(userId);
    dispatch(followUnfollowUser({ userId, token, currentUser:user.id, isFollowing: isUserFollowing }))
    .then(() => {
        dispatch(fetchSuggestions(token)); 
        dispatch(fetchProfile({ userId:user.id, token })); 
      });

    if (isUserFollowing) {
      setFollowingUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setFollowingUsers((prev) => [...prev, userId]);
    }
  };

  useEffect(() => {
    if (user?.following) {
      setFollowingUsers(user.following);
      setIsFollowing(user.following.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
    }
  }, [user,dispatch]);
  
  useEffect(() => {
    setIsFollowing(followingUsers.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
  }, [followingUsers]);

  if (!limitedSuggestions.length) return null;

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-800">Suggestions for you</h3>
      <button
        onClick={() => navigate('/see-all')}
        className="text-blue-500 hover:underline text-sm"
      >
        See All
      </button>
    </div>
    <ul>
      {limitedSuggestions.map((suggestion) => (
        <li
          key={suggestion.id}
          className="flex items-center justify-between p-2 mb-2 border-b border-gray-300"
        >
          <Link
            to={`/profileview/${suggestion.id}`}
            className="flex items-center flex-1 mr-4"
            title="Profile"
          >
            <img
              className="w-10 h-10 rounded-full mr-3 object-cover"
              src={suggestion.profile_pic || 'https://via.placeholder.com/800x500'}
              alt={suggestion.username}
            />
            <p className="text-sm font-medium truncate">{suggestion.username}</p>
          </Link>
          <button
            className="text-blue-500 border border-blue-500 px-4 py-1 rounded-md hover:bg-blue-500 hover:text-white"
            onClick={() => handleFollowUnfollow(suggestion.id)}
          >
            {isFollowing[suggestion.id] ? 'Unfollow' : 'Follow'}
          </button>
        </li>
      ))}
    </ul>
  </div>
  );
};

export default Suggestion;