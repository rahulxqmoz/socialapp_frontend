import React, { useEffect, useState } from 'react';
import ChatDialog from '../components/ChatDialog';
import UserList from '../components/UserListMessage';
import { fetchFollowers } from '../features/auth/followerSlice';
import { showErrorToast } from '../components/ErroToast';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../config';
import CreateGroupModal from '../components/CreateGroupModal';
import { createGroup } from '../features/auth/groupChatSlice';
import { showSuccessToast } from '../components/CustomToast';
import { useNavigate } from 'react-router-dom';

const ChatDialogMessage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const currentUser = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  //const [followers,setFollowers] = useState([])
  const [isCheckingFollowing, setIsCheckingFollowing] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groupName, setGroupName] = useState('');
  const followers = useSelector((state) => state.followers.followers); 
  const  dispatch = useDispatch();
  const navigate = useNavigate()




  useEffect(() => {
  
    if (token) {
      dispatch(fetchFollowers({ userId:currentUser.id, token,followertype:'following' }));
    }
  }, [token,currentUser]);



  const checkIfUserIsFollowing = async (selectedUserId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/interactions/connections/`, {
        params: {
          user_id: selectedUserId,
          type: 'following',
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const followers = response.data; // Assuming response.data contains an array of followers
      return followers.some(follower => follower.id === currentUser.id); // Check if currentUser is followed
    } catch (error) {
      console.error("Error checking if user is following:", error);
      showErrorToast("An error occurred while checking if the user is following.");
      return false;
    }
  };
  const handleUserSelect =async  (user,generatedRoomName) => {
    setIsCheckingFollowing(true);

    const isFollowing = await checkIfUserIsFollowing(user.id);
    console.log(`Is user ${user.id} following: ${isFollowing}`);

    if (!isFollowing) {
      showErrorToast('You can\'t message this user. This user is not following you!');
      setIsCheckingFollowing(false); // Reset the checking flag
      setSelectedUser(null);
      return;
    }
    setSelectedUser(user); 
    setRoomName(generatedRoomName);
    setIsCheckingFollowing(false); 
  };
  const handleCreateGroupClick = () => {
    setIsCreateGroupModalOpen(true);
  };
  const closeCreateGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };
  const handleParticipantChange = (userId) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSubmitGroupCreation = async () => {
    try {
      dispatch(createGroup({ groupName, members: selectedParticipants, token }))
      .then((result) => {
        if (result.type === 'groupChat/createGroup/fulfilled') {
          showSuccessToast('Group created')
          closeCreateGroupModal();
          setGroupName('');
          setSelectedParticipants([]);
          setTimeout(() => {
            navigate('/groupchat')
          }, 2000);
          navigate('/groupchat')
        } else {
          showErrorToast('Group creation failed')
     
        }
      })
      .catch((err) => {
        console.error('An error occurred:', err);
      });
      
     } catch (error) {
      console.error("Error creating group:", error);
      showErrorToast("An error occurred while creating the group.");
    }
  };


  return (
    <div className="flex h-screen">
    {/* UserList Section */}
    <div
      className="w-1/3 md:w-1/4 lg:w-1/5 border-r p-4 overflow-y-auto bg-white fixed"
      style={{ height: '100vh' }}
    >
      <UserList onUserSelect={handleUserSelect} onCreateGroup={handleCreateGroupClick} />
    </div>
  
    {/* ChatDialog Section */}
    <div
      className="flex-grow p-4 bg-gray-100"
      style={{
        marginLeft: '33%',
        width: 'calc(100% - 40%)',
        position: 'fixed',
        top: '70px',
        bottom: '0',
        right: '0',
        overflowY: 'auto',
      }}
    >
      {selectedUser ? (
        <ChatDialog roomName={roomName} user={selectedUser} />
      ) : (
        <div className="text-center text-gray-500">
          Select a user to start chatting
        </div>
      )}
    </div>


      <CreateGroupModal 
        isCreateGroupModalOpen={isCreateGroupModalOpen}
        closeCreateGroupModal={closeCreateGroupModal}
        groupName={groupName}
        setGroupName={setGroupName}
        followers={followers}
        selectedParticipants={selectedParticipants}
        handleParticipantChange={handleParticipantChange}
        handleSubmitGroupCreation={handleSubmitGroupCreation}
      />
  </div>
  );
};

export default ChatDialogMessage;
