import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { followUnfollowUser } from '../features/auth/profileSlice';
import { fetchFollowers } from '../features/auth/followerSlice';

const Following = () => {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const { userId } = useParams(); 
  //const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  //const [loading, setLoading] = useState(true);
  const following = useSelector((state) => state.followers.followers); // Fetch followers from state
  const loading = useSelector((state) => state.followers.loading); // Get loading state
  
  useEffect(() => {
    // Fetch following list when component loads
    dispatch(fetchFollowers({ userId, token,followertype:'following' }));
  }, [token,user,dispatch]);
  const checkUser=user.id

  // const fetchFollowing = async () => {
  //   setLoading(true);
  //   try {
  //       const response = await axios.get(`${BASE_URL}/api/interactions/connections/?user_id=${userId}&type=following`, {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         });
  //         setFollowing(response.data);
  //         console.log(response.data)
  //   } catch (error) {
  //     console.error('Error fetching following:', error);
  //   }
  //   finally {
  //       setLoading(false); 
  //     }
  // };
  
  const handleFollowUnfollow = (userId,isFollowing) => {
    dispatch(followUnfollowUser({ userId, token,currentUser:user.id , isFollowing }));
  };

 
  const filteredFollowing = following.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-lg mx-auto p-4">
  <h1 className="text-2xl font-bold mb-4">Following</h1>
  <input
    type="text"
    placeholder="Search following..."
    className="mb-4 p-2 w-full border border-gray-300 rounded-md"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />

  {loading ? (
    <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>
  ) : filteredFollowing.length === 0 ? (
    <div className="text-center text-gray-500">Not following anyone yet.</div>
  ) : (
    <ul className="space-y-4 p-4">
      {filteredFollowing.map((user) => (
        <Link
          to={`/profileview/${user.id}`}
          className="text-blue-500 hover:text-blue-700"
          title="Profile"
        >
          <li key={user.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md mt-1">
            <div className="flex items-center space-x-4">
              <img src={user.profile_pic || 'https://via.placeholder.com/800x500'} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              <span>{user.username}</span>
            </div>
            {checkUser  === user.id ? null : (
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleFollowUnfollow(user.id, user.is_following)}
                  className={`text-blue-500 border border-blue-500 px-4 py-1 rounded-md hover:bg-blue-500 hover:text-white w-24 ${user.is_following ? 'disabled' : ''}`}
                >
                  {user.is_following ? 'Following' : 'Follow'}
                </button>
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

export default Following;
