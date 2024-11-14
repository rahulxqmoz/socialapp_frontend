import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserGroups } from '../features/auth/groupChatSlice';
import ParticipantModal from '../components/ParticipantModal';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
const ListGroupsPage = () => {
  const token = useSelector((state)=>state.auth.token)  
  const dispatch = useDispatch();
  const { groups, loading, error } = useSelector((state) => state.groupChat);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const navigate=useNavigate()

  useEffect(() => {
    dispatch(fetchUserGroups({ token }));
  }, [dispatch, token]);

  const handleViewParticipants = (participants) => {
    setSelectedParticipants(participants);
    setShowParticipantsModal(true);
  };

  const closeParticipantsModal = () => {
    setShowParticipantsModal(false);
    setSelectedParticipants([]);
  };
  const handleGroupClick = (groupId) => {
    // Navigate to GroupChatBox with groupId
    navigate(`/chat/${groupId}`);
  };
  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader color="#3498db" loading={loading} size={50} />
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col space-y-4 bg-gray-100 p-6 rounded-md shadow-md">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Groups</h2>
    {groups.map((group) => (
      <div
        key={group.id}
        className="flex items-center justify-between bg-white rounded-lg shadow-lg p-4 hover:bg-gray-50 transition"
      >
        <div className="flex flex-col cursor-pointer" onClick={() => handleGroupClick(group.id)} >
          <h3 className="text-lg font-semibold text-gray-800">{group.group_name}</h3>
          <p className="text-sm text-gray-600">
            {group.messages.length > 0 ? (
              <span>Last message: {group.messages[group.messages.length - 1].message}</span>
            ) : (
              <span>No messages yet</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {group.unread_count > 0 && (
            <span className="bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
              {group.unread_count}
            </span>
          )}
          <button
            onClick={() => handleViewParticipants(group.participants)}
            className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600 transition"
          >
            View Participants
          </button>
        </div>
      </div>
    ))}

    {/* Participant Modal */}
    <ParticipantModal
      isOpen={showParticipantsModal}
      onClose={closeParticipantsModal}
      participants={selectedParticipants}
    />
  </div>
  );
};

export default ListGroupsPage;
