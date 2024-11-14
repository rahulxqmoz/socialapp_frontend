import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchSuggestions } from '../features/auth/suggestionSlice';
import { followUnfollowUser } from '../features/auth/profileSlice';

const SuggestionList = () => {
  const dispatch = useDispatch();
  const { suggestions, loading, error } = useSelector((state) => state.suggestions);
  const token = useSelector((state) => state.auth.token); // Get the token from auth state
  const [searchQuery, setSearchQuery] = useState('');
  const user  = useSelector((state) => state.user.user);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState({}); // Define a state variable to keep track of whether the user is following the suggestion or not

  const currentUser = user

  useEffect(() => {
    if (token) {
      dispatch(fetchSuggestions(token));
    }
  }, [dispatch, token]);

  const handleFollowUnfollow = (userId) => {
    const isUserFollowing = followingUsers.includes(userId);
    dispatch(followUnfollowUser({ userId, token, currentUser:currentUser.id, isFollowing: isUserFollowing }));

    if (isUserFollowing) {
      setFollowingUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setFollowingUsers((prev) => [...prev, userId]);
    }
  };

  useEffect(() => {
    if (currentUser?.following) {
      setFollowingUsers(currentUser.following);
      setIsFollowing(currentUser.following.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
    }
  }, [currentUser]);

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Suggestions for You</h1>
      <input
        type="text"
        placeholder="Search suggestions..."
        className="mb-4 p-2 w-full border border-gray-300 rounded-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error.detail || 'An error occurred.'}</div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center text-gray-500">No suggestions available.</div>
      ) : (
        <ul className="space-y-4">
          {filteredSuggestions.map((suggestion) => (
            <Link
              to={`/profileview/${suggestion.id}`}
              className="text-blue-500 hover:text-blue-700"
              title="Profile"
              key={suggestion.id}
            >
              <li className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center space-x-4">
                  <img
                    src={suggestion.profile_pic || 'https://via.placeholder.com/800x500'}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span>{suggestion.username}</span>
                </div>
                <button
                  className="text-blue-500 border border-blue-500 px-4 py-1 rounded-md hover:bg-blue-500 hover:text-white"
                  onClick={() => handleFollowUnfollow(suggestion.id)}
                >
                  {isFollowing[suggestion.id] ? 'Unfollow' : 'Follow'}
                </button>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SuggestionList;