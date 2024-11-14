import React, { useState } from 'react';
import  Picker  from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FaSmile, FaTimes } from 'react-icons/fa';

const BioField = ({ bio, handleProfileChange }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Function to add emoji to the bio
  const handleAddEmoji = (emoji) => {
    const newBio = bio + emoji.native;
    
    // Trigger handleProfileChange to update bio state
    handleProfileChange({
      target: {
        name: 'bio',
        value: newBio,
      },
    });
  };

  return (
    <div className="bio-field-container w-full">
    <div className="relative w-full">
      <textarea
        name="bio"
        value={bio}
        onChange={handleProfileChange}
        placeholder="Write something about yourself..."
        className="w-full p-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Emoji Toggle Button Positioned Inside the Textarea */}
      <button
        type="button"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-800"
      >
        {showEmojiPicker ? (
          <FaTimes size={20} className="text-red-500" />  
        ) : (
          <FaSmile size={20} className="text-gray-500" /> 
        )}
      </button>
    </div>

    {showEmojiPicker && (
      <div className="mt-2">
        <Picker data={data} onEmojiSelect={handleAddEmoji} />
      </div>
    )}
  </div>
  );
};

export default BioField;
