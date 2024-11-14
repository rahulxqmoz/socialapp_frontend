import React, { useState, useRef, useEffect } from 'react';
import { FaSmile, FaTimes } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import ImageCropper from '../Cropper';


const EditPostBox = ({ onPostSubmit,post  }) => {
  //const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // For image preview
  const [croppedImage, setCroppedImage] = useState(null); // Cropped image data
  const [selectedVideo, setSelectedVideo] = useState(null); // For video preview
  const [error, setError] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCropper, setShowCropper] = useState(false); // To show cropper
  const [showTrimmer, setShowTrimmer] = useState(false); // To show video trimmer
  const cropperRef = useRef(null); // Ref for the cropper
  const imageInputRef = useRef(null); // Ref for clearing image input
  const emojiPickerRef = useRef(null); // Ref for the emoji picker
  const [content, setContent] = useState(post ? post.content : '');
  const [image, setImage] = useState(post ? post.image : '');
  const [video, setVideo] = useState(post ? post.video : '');
  const [trimmedVideo, setTrimmedVideo] = useState(null);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setImage(post.image);
      setVideo(post.video);
    } else {
      setContent('');
      setImage('');
      setVideo('');
    }
  }, [post]);


  // Handle text area content change
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // Handle emoji click event to add emoji to textarea
  const handleEmojiClick = (emojiObject) => {
    setContent((prevContent) => prevContent + emojiObject.emoji);
    setShowEmojiPicker(false); // Hide emoji picker after selection
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
    if (!content.trim()) {
      setError('Post content or media is required.');
      return;
    }

    onPostSubmit({ content: content });
    setContent('');
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
      value={content}
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
    {/* Display existing post image */}
    {image && !selectedImage && (
  <div className="relative mb-2" style={{ width: '100px', height: '100px' }}>
    <img 
      src={image} 
      alt="Existing" 
      className="w-full h-full object-cover rounded-md" 
    />
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
     {/* Display existing post video */}
     {video && !selectedVideo && (
        <div className="relative mb-2">
          <video src={video} controls className="w-full h-auto rounded-md" />
        </div>
      )}
  
    {/* Error message */}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
  
  );
};

export default EditPostBox;
