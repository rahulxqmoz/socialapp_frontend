import React, { useState, useRef, useEffect } from 'react';
import { FaSmile, FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import ImageCropper from '../Cropper';


const PostBox = ({ onPostSubmit }) => {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // For image preview
  const [croppedImage, setCroppedImage] = useState(null); // Cropped image data
  const [selectedVideo, setSelectedVideo] = useState(null); // For video preview
  const [trimmedVideo, setTrimmedVideo] = useState(null); // Trimmed video data
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCropper, setShowCropper] = useState(false); // To show cropper
  const [showTrimmer, setShowTrimmer] = useState(false); // To show video trimmer
  const cropperRef = useRef(null); // Ref for the cropper
  const imageInputRef = useRef(null); // Ref for clearing image input
  const emojiPickerRef = useRef(null); // Ref for the emoji picker

  // Handle text area content change
  const handleContentChange = (e) => {
    setPostContent(e.target.value);
  };

  // Handle emoji click event to add emoji to textarea
  const handleEmojiClick = (emojiObject) => {
    setPostContent((prevContent) => prevContent + emojiObject.emoji);
    setShowEmojiPicker(false); // Hide emoji picker after selection
  };

  // Handle file selection (image/video)
  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    if (type === 'image' && validImageTypes.includes(file.type)) {
      setSelectedImage(URL.createObjectURL(file));
      setSelectedVideo(null); // Clear video if image is selected
      setShowCropper(true); // Show the cropper when image is selected
    } else if (type === 'video' && validVideoTypes.includes(file.type)) {
      setSelectedVideo(URL.createObjectURL(file));
      setTrimmedVideo(URL.createObjectURL(file))
     
    } else {
      setError('Please select a valid image or video file.');
    }

    // Clear the file input after selection
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Handle saving the cropped image
  const handleSaveCrop = () => {
    const cropper = cropperRef.current.cropper; // Get the cropper instance
    const croppedImageUrl = cropper.getCroppedCanvas().toDataURL(); // Get the cropped image data URL
    setCroppedImage(croppedImageUrl); // Save cropped image
    setShowCropper(false); // Hide cropper after saving
    setSelectedImage(null); // Clear selected image
  };

  

  // Handle removing the selected image or video
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setCroppedImage(null);
    setShowCropper(false);
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setTrimmedVideo(null);
    setShowTrimmer(false);

    if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
  };
  const videoInputRef = useRef(null);
  // Handle post submission
  const handlePost = () => {
    if (!postContent.trim() && !croppedImage && !trimmedVideo) {
      setError('Post content or media is required.');
      return;
    }

    onPostSubmit({ content: postContent, image: croppedImage, video: trimmedVideo });
    setPostContent('');
    setSelectedImage(null);
    setCroppedImage(null);
    setSelectedVideo(null);
    setTrimmedVideo(null);
    setError(null);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="border p-4 rounded-md shadow-sm relative">
    <textarea
      className="w-full p-2 border border-gray-300 rounded-md mb-2"
      placeholder="What's on your mind?"
      value={postContent}
      onChange={handleContentChange}
    />
  
    <div className="flex items-center justify-between mb-4">
      {/* Left section with emoji, image, and video buttons */}
      <div className="flex items-center space-x-4">
        {/* Emoji button */}
        <button
          type="button"
          className="flex items-center space-x-1 relative"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <FaSmile className="text-xl text-gray-500 cursor-pointer" />
        </button>
  
        {/* Show emoji picker */}
        {showEmojiPicker && (
          <div className="absolute z-10 bottom-12 left-0" ref={emojiPickerRef}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
  
        {/* Image upload */}
        <label htmlFor="image-upload" className="cursor-pointer flex items-center space-x-1">
          <FaImage className="text-xl text-gray-500" />
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'image')}
            className="hidden"
            ref={imageInputRef}
          />
        </label>
  
        {/* Video upload */}
        <label htmlFor="video-upload" className="cursor-pointer flex items-center space-x-1">
          <FaVideo className="text-xl text-gray-500" />
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={(e) => handleFileChange(e, 'video')}
            className="hidden"
            ref={videoInputRef}
          />
        </label>
      </div>
  
      {/* Post button aligned to the right */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow hover:bg-blue-600"
        onClick={handlePost}
      >
        Post
      </button>
    </div>
  
    {/* Image Cropper */}
    {showCropper && selectedImage && (
      <ImageCropper
        ref={cropperRef}
        modalImage={selectedImage}
        onSave={handleSaveCrop}
        onClose={() => setShowCropper(false)}
      />
    )}
  
    {/* Cropped Image Preview */}
    {croppedImage && (
      <div className="mb-2 relative">
        <img src={croppedImage} alt="Cropped" className="max-w-full h-auto rounded-md" />
        <button
          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
          onClick={handleRemoveImage}
        >
          <FaTimes />
        </button>
      </div>
    )}
  
    {/* Trimmed Video Preview */}
    {selectedVideo && (
      <div className="mb-2 relative">
        <video controls src={selectedVideo} className="max-w-full h-auto rounded-md" />
        <button
          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
          onClick={handleRemoveVideo}
        >
          <FaTimes />
        </button>
      </div>
    )}
  
    {/* Error message */}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
  
  );
};

export default PostBox;
