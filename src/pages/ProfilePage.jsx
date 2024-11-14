import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../config';
import Modal from 'react-modal';
import 'cropperjs/dist/cropper.css';
import { logout } from '../features/auth/userSlice';
import { showErrorToast } from '../components/ErroToast';
import ImageCropper from '../components/Cropper';
import 'react-quill/dist/quill.snow.css';
import PostBox from '../components/ProfilePageComponents/PostBoxComponent';
import { showSuccessToast } from '../components/CustomToast';
import ProfileHeader from '../components/ProfilePageComponents/ProfileHeader';
import ProfileSection from '../components/ProfilePageComponents/ProfileSection';
import PostListComponent from '../components/ProfilePageComponents/PostListComponent';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, uploadProfileImage } from '../features/auth/profileSlice';
import { createNewPost, fetchPosts, handleBookmark, handleLike } from '../features/auth/postSlice';


Modal.setAppElement('#root');

const ProfilePage = () => {
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [openCommentId, setOpenCommentId] = useState(null); 
  const [imageType, setImageType] = useState(''); // 'cover' or 'profile'
  const cropperRef = useRef(null); 
  const [comments, setComments] = useState({}); 
  const [newComment, setNewComment] = useState(""); 
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); 
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile, followerCount, followingCount, loading:userLoading, error:userError } = useSelector((state) => state.profile);
  const { posts, loading:postLoading, error:postError } = useSelector((state) => state.posts);
  const likedPosts = useSelector((state) => state.likedPosts);
  const bookmarkPosts = useSelector((state) => state.bookmarkPosts);
  const dispatch = useDispatch()
  const navigate=useNavigate();

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/${postId}/comments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: response.data,
        
      }));
    } catch (error) {
      console.log("Error fetching comments");
    }
  };

  useEffect(() => {
    if (user && token) {
      dispatch(fetchProfile({ userId:user.id, token }));
      dispatch(fetchPosts({ userId: user.id, token }));
      
      
    }
  }, [user, token]);



  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach((post) => {
        console.log(`Correct post id: ${post.id}`);
        fetchComments(post.id);
      });
    }
  }, [posts]);

  const handleLogout=()=>{
    dispatch(logout());
    navigate('/login')
  }

  const handleFileChange = (event, type) => {
    const fileInput = event.target;
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validImageTypes.includes(file.type)) {
        // setError('Please select a valid image file (JPEG, JPG, or PNG).');
        showErrorToast('Please select a valid image file (JPEG, JPG, or PNG).');
        fileInput.value = null; 
        return;
      }
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalImage(reader.result);
        setImageType(type);
        setModalIsOpen(true);
        fileInput.value = null; 
      };
      reader.readAsDataURL(file);
    } else {
      console.error('No file selected.');
    }
  };

  const handleImageUpload = async () => {
    if (!cropperRef.current) return;

    const cropper = cropperRef.current.cropper;
    const canvas = cropper.getCroppedCanvas();
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append(imageType === 'cover' ? 'cover_pic' : 'profile_pic', blob, 'cropped-image.jpg');

      try {
       
        dispatch(uploadProfileImage({ imageBlob: blob, imageType, token, userId: user.id }));
       
        closeModal();

      } catch (err) {
        setError('An error occurred while uploading the image.');
      }
    }, 'image/jpeg');
  };


  const openModal = (type) => {
    setImageType(type);
    document.getElementById(`${type}-upload`).click(); // Trigger the file input click
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalImage('');
  };

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  
  const handleNewPost  = (postData) => {
    const userId = user.id;
    dispatch(createNewPost({ postData, userId, token }));
  };

  const postLike = async  (postId) => {
    dispatch(handleLike({ postId, token ,userId:user.id}));
  };



  const handleSubmitComment = async (postId, commentText, parentId = null) => {
    if (!commentText.trim()) {
      showErrorToast('Empty Comment Box');
      return;
    }
    console.log(postId,commentText,user.id,parentId,token);
    try {
      const response = await axios.post(`${BASE_URL}/api/comments/`, {
        post: postId,
        content: commentText,
        user: user.id,
        parent: parentId, // Include parentId here
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const newCommentData = response.data;
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: [...(prevComments[postId] || []), newCommentData],
      }));
  
      setNewComment("");
      setReplyingToCommentId(null);
     
      showSuccessToast("Comment submitted successfully");
      dispatch(fetchPosts({ userId: user.id, token }));
    } catch (error) {
      showErrorToast("Error submitting comment");
    }
  };
  const handleToggleComments = (postId) => {
    if (openCommentId === postId) {
      setOpenCommentId(null); // Close the comments section if it's already open
    } else {
      setOpenCommentId(postId); // Open the comments section for the specific post
    }
  };

  const handleAddEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji.native); // Append the selected emoji to the comment text
  };
 
  
  const toggleBookmark = (postId,isBookmarked) => {
    //const isBookmarked = bookmarkPosts[postId];
    dispatch(handleBookmark({ postId, token, isBookmarked }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md overflow-hidden mt-8">
      
    {/* Profile Header */}
    {userLoading && (<div className="flex justify-center items-center mb-2">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>)}
    {userError && <p className="text-red-500">{userError}</p>}
    
    <ProfileHeader profile={profile} handleFileChange={handleFileChange} openModal={openModal}/>
    {/* Profile Details */}
    <div className="p-4 sm:p-6">
    {/* Profile Section */}
    <ProfileSection user={user} profile={profile} followerCount={followerCount} followingCount={followingCount}/>
    {loading && (
      <div className="flex justify-center items-center mb-2">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    )}
    {postLoading && (<div className="flex justify-center items-center mb-2">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>)}
      {postError && <p className="text-red-500">{postError}</p>}
    {/* PostBox Section */}
    <PostBox onPostSubmit={handleNewPost} />

  
   
      <PostListComponent 
      posts={posts}
      user={user}
      likedPosts={likedPosts}
      handleLike={postLike}
      handleToggleComments={handleToggleComments}
      handleBookmark={toggleBookmark}
      bookmarkPosts={bookmarkPosts}
      openCommentId={openCommentId}
      handleSubmitComment={handleSubmitComment}
      replyingToCommentId={replyingToCommentId}
      setReplyingToCommentId={setReplyingToCommentId}
      setCommentText={setCommentText}
      setShowEmojiPicker={setShowEmojiPicker}
      showEmojiPicker={showEmojiPicker}
      handleAddEmoji={handleAddEmoji}
      comments={comments}
      commentText={commentText}
      profilePage={true}
      />
   
  </div>

  {/* Cropper Modal */}
  <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="w-full max-w-2xl mx-auto mt-16">
    <ImageCropper modalImage={modalImage} onSave={handleImageUpload} onClose={closeModal} ref={cropperRef} imageType={imageType}/>
  </Modal>
</div>

  );
};

export default ProfilePage;
