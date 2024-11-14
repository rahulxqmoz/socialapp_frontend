import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowers } from '../features/auth/followerSlice';
import { fetchUnreadCounts, updateUnreadCounts } from '../features/auth/chatSlice';

const UserList = ({ onUserSelect,onCreateGroup  }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const followers = useSelector((state) => state.followers.followers); 
  const loading = useSelector((state) => state.followers.loading); 
  const error = useSelector((state) => state.followers.error); 
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const unreadCounts = useSelector((state) => state.chat.unreadMessages);

  useEffect(() => {
    // Fetch followers when component loads
    if (token) {
      dispatch(fetchFollowers({ userId:user.id, token,followertype:'following' }));
      //fetchUnreadCounts();
      dispatch(fetchUnreadCounts({token}))
    }
  }, [token,user]);

  useEffect(() => {
    // Setup WebSocket connection for real-time unread counts
    const wsUrl = `ws://localhost:8000/ws/unreadnotifications/${user.id}/?token=${token}`;
    const notificationSocket = new WebSocket(wsUrl);

    notificationSocket.onopen = () => {
      console.log("WebSocket connected for notifications in userlist");
    };

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "unread_counts") {
        // console.log(`data recieved unread_counts`)
        // console.log(`unread_counts:${data.unread_counts}`)
        // console.log("unread_counts (as JSON):", JSON.stringify(data.unread_counts, null, 2));
        // // Dispatch an action to update the unread counts in the Redux store
        // const dataUser = JSON.stringify(data.unread_counts[user.id], null, 2);
        // console.log("dataUser", dataUser);

        dispatch(updateUnreadCounts(data.unread_counts[user.id]));
      }
    };

    notificationSocket.onclose = (event) => {
      console.error("WebSocket closed unexpectedly");
    };

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      notificationSocket.close();
    };
  }, [dispatch]);

  
  // Filter followers based on search input
  const filteredFollowers = followers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const generateRoomName = (userId) => {
    const currentUserId = user.id; // Assuming `user` is the logged-in user
    const sortedIds = [currentUserId, userId].sort((a, b) => a - b); // Sort the IDs to avoid different order issues
    return `room_${sortedIds[0]}_${sortedIds[1]}`; // Create a room name using both user IDs
  };
  if (!unreadCounts) return <div>Loading unread counts...</div>;
  return (
    <div className="w-full">
    {/* Search Box */}
    <div className="p-2">
      <input
        type="text"
        placeholder="Search users..."
        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    <div className="p-2">
        <button
          onClick={onCreateGroup}
          className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Create Group
        </button>
      </div>

    {/* User List */}
    <div className="mt-2 max-h-96 overflow-y-auto">
      {filteredFollowers.length > 0 ? (
        filteredFollowers.map((user) => (
          <div
            key={user.id}
            className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors duration-200 ease-in-out"
            onClick={() => onUserSelect(user, generateRoomName(user.id))}
          >
            <img
              src={user.profile_pic || 'https://via.placeholder.com/30'}
              alt={user.username}
              className="w-6 h-6 rounded-full object-cover mr-3"
            />
           <span className="font-medium">{user.username}</span>
           {unreadCounts?.[user.id] > 0 && (
              <span className="text-xs font-bold text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center ml-2">
                {unreadCounts[user.id] || 0}
              </span>
            )}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center p-4">No users found</div>
      )}
    </div>
  </div>
  );
};

export default UserList;
