import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createAnnouncement, resetAnnouncementState } from '../features/auth/announcementSlice';
import { FaSmile, FaTimes } from 'react-icons/fa'; // Emoji toggle icons
import Picker from '@emoji-mart/react'; // Emoji picker component
import data from '@emoji-mart/data';

const AdminAnnouncementPage = () => {
  const dispatch = useDispatch();
  const { success, error } = useSelector((state) => state.announcement);
  const token = useSelector((state) => state.auth.token); // assuming you are storing the token in local storage
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [announcement, setAnnouncement] = useState('');

    
  useEffect(() => {
    if (success) {
      toast.success('Announcement created successfully!');
      setAnnouncement(''); // Clear input after successful submission
      dispatch(resetAnnouncementState());
    }
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [success, error, dispatch]);

    // Handle emoji selection
    const handleAddEmoji = (emoji) => {
    setAnnouncement(prev => prev + emoji.native); // Append emoji to the announcement input
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!announcement.trim()) {
      toast.warn('Content cannot be empty!');
      return;
    }
    dispatch(createAnnouncement({ content:announcement, token }));
  };

  return (
    <div className="flex flex-col h-full p-4">
    <h1 className="text-2xl font-semibold mb-4">Create Announcement</h1>
    <form onSubmit={handleSubmit} className="space-y-4 relative">
        {/* Announcement input with Emoji Picker inside */}
        <div className="relative">
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" // Added padding to the right
            placeholder="Type your announcement here..."
            rows={5}
          />

          {/* Emoji Picker Button inside text area */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          >
            {showEmojiPicker ? <FaTimes size={20} /> : <FaSmile size={20} />}
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-12 right-2 z-10">
              <Picker data={data} onEmojiSelect={handleAddEmoji} />
            </div>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Submit Announcement
        </button>
      </form>
</div>
  );
};

export default AdminAnnouncementPage;
