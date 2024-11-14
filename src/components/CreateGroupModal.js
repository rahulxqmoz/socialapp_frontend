import React, { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FaSmile, FaTimes } from 'react-icons/fa';
import './CreateGroupModal.css'
const CreateGroupModal = ({
  isCreateGroupModalOpen,
  closeCreateGroupModal,
  groupName,
  setGroupName,
  followers,
  selectedParticipants,
  handleParticipantChange,
  handleSubmitGroupCreation,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleAddEmoji = (emoji) => {
    setGroupName((prev) => prev + emoji.native); // Append the selected emoji to the group name
  };

  return (
    <>
      {isCreateGroupModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
          onClick={closeCreateGroupModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative"
            onClick={(e) => e.stopPropagation()} // Prevent click events from bubbling up to the overlay
          >
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={closeCreateGroupModal}
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Create Group</h2>

            <div className="mb-4 relative"> {/* Added relative for positioning the emoji button */}
              <label htmlFor="groupName" className="block mb-1">
                Group Name
              </label>
              <div className="relative w-full">
                    <input
                    type="text"
                    id="groupName"
                    className="w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    />
                    <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-800"
                    >
                    {showEmojiPicker ? (
                        <FaTimes size={20} className="text-red-500" />
                    ) : (
                        <FaSmile size={20} className="text-gray-500" />
                    )}
                    </button>
                </div>

              {showEmojiPicker && (
                <div className="absolute mt-1 mb-10 right-0 emoji-picker"> {/* Apply custom class here */}
                <Picker 
                  data={data} 
                  onEmojiSelect={handleAddEmoji} 
                />
              </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="participants" className="block mb-1">
                Select Participants
              </label>
              <div className="max-h-48 overflow-y-auto">
                {followers.map((user) => (
                  <div key={user.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`participant-${user.id}`}
                      checked={selectedParticipants.includes(user.id)}
                      onChange={() => handleParticipantChange(user.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`participant-${user.id}`}>
                      {user.username}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitGroupCreation}
              className="w-full p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGroupModal;
