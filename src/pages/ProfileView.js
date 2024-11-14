import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../config';
import { showErrorToast } from '../components/ErroToast';
import { showSuccessToast } from '../components/CustomToast';
import { logout } from '../features/auth/userSlice';
import PostListComponent from '../components/ProfilePageComponents/PostListComponent';
import { fetchProfile, followUnfollowUser } from '../features/auth/profileSlice';
import { fetchBookmarks, fetchPosts, handleBookmark, handleLike } from '../features/auth/postSlice';




const UserProfilePage = () => {
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [openCommentId, setOpenCommentId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); 
  const { id } = useParams(); // Get userId from URL params
  const userId = id
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.user.user);
  const currentUser=user.id;
  const dispatch = useDispatch()
  const navigate=useNavigate();
  const { profile, isFollowing, followerCount, followingCount, loading:userLoading, error:userError } = useSelector((state) => state.profile);
  const { posts } = useSelector((state) => state.posts);
  const likedPosts = useSelector((state) => state.likedPosts);
  const bookmarkPosts = useSelector((state) => state.bookmarkPosts);

  useEffect(() => {
    if (id && token) {
      dispatch(fetchProfile({ userId, token }));
      dispatch(fetchPosts({ userId: id, token }));
      dispatch(fetchBookmarks({ token }));
    }
  }, [id, token,dispatch]);


  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/posts/${postId}/comments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`getting comment resposne:${response.data}`)
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: response.data,
        
      }));
    } catch (error) {
      console.log("Error fetching comments");
    }
  };


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
  const postLike = async  (postId) => {
    dispatch(handleLike({ postId, token ,userId:id}));
  };


  const handleToggleComments = (postId) => {
    if (openCommentId === postId) {
      setOpenCommentId(null);
    } else {
      setOpenCommentId(postId);
      fetchComments(postId);
    }
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
      dispatch(fetchPosts({ userId: user.id, token }));
      showSuccessToast("Comment submitted successfully");
     
    } catch (error) {
      showErrorToast("Error submitting comment");
    }
  };
 
  const handleFollowUnfollow = () => {
    dispatch(followUnfollowUser({ userId, token,currentUser , isFollowing }));
  };

  const handleAddEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji.native); // Append the selected emoji to the comment text
  };
  
  const toggleBookmark = (postId,isBookmarked) => {
    dispatch(handleBookmark({ postId, token, isBookmarked }));
  };

  
  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  

  return (

    
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md overflow-hidden mt-8">
      
        <div
    className="relative h-48 sm:h-60 bg-cover bg-center cursor-pointer"
    style={{ backgroundImage: `url(${profile.cover_pic || 'https://via.placeholder.com/800x500'})` }}
  >
   
   {userLoading && (<div className="flex justify-center items-center mb-2">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    </div>)}
    {userError && <p className="text-red-500">{userError}</p>}
    

    {/* Profile Picture */}
    <div className="absolute bottom-0 left-2 sm:left-4 transform -translate-y-1/2">
      <div className="relative">
        <img
          src={profile.profile_pic || 'https://via.placeholder.com/100'}
          alt="Profile"
          accept="image/*"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md cursor-pointer object-cover"
          
        />
    
        
        
            </div>
            </div>
        </div>
        <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              {/* User Info */}
              <div className="text-center sm:text-left flex items-center space-x-4 mb-4 sm:mb-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold">{profile.first_name}</h2>
                  <h2 className="text-sm text-teal-800 opacity-75 shadow-sm">{`@${profile.username}`}</h2>
                </div>
              </div>

              {/* Metrics and Button Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
              <div className="flex flex-col items-center">
              {isFollowing ? (
                <Link to={`/followers/${profile.id}`}>
                  <p className="text-lg font-semibold cursor-pointer">{followerCount}</p>
                </Link>
              ) : (
                <p className="text-lg font-semibold cursor-not-allowed">{followerCount}</p>
              )}
              <p className="text-sm text-gray-600 font-semibold">Followers</p>
             
            </div>

          
            <div className="flex flex-col items-center">
            {isFollowing ? (
              <Link to={`/following/${profile.id}`}>
                <p className="text-lg font-semibold cursor-pointer">{followingCount}</p>
              </Link>
              ):(
                <p className="text-lg font-semibold cursor-pointer">{followingCount}</p>
              )}
              <p className="text-sm text-gray-600 font-semibold">Following</p>
            </div>

            {currentUser!==userId? <div className="flex justify-center">
                  
                  <button
                    onClick={handleFollowUnfollow}
                    className={`px-4 py-2 rounded-lg font-semibold text-white ${
                      isFollowing ? 'bg-red-500' : 'bg-blue-500'
                    } hover:opacity-90`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                </div>:null}
              </div>
            </div>

        
            <PostListComponent 
              posts={posts}
              user={profile}
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
              />
       
           
            
        </div>
     

      
    </div>
  );
};

export default UserProfilePage;
