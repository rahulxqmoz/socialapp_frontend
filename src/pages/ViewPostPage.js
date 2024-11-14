import React, { useEffect, useState } from 'react';
import {  useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { BASE_URL } from '../config';
import { showErrorToast } from '../components/ErroToast';
import { showSuccessToast } from '../components/CustomToast';
import { fetchProfile } from '../features/auth/profileSlice';
import {  fetchPosts, handleBookmark, handleLike, viewPost } from '../features/auth/postSlice';
import ViewPostBoxComponent from '../components/ViewPostBoxComponent';


const ViewPostPage = () => {
  const { postId } = useParams(); 
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [openCommentId, setOpenCommentId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); 
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch()
  const {  profile,loading:userLoading, error:userError } = useSelector((state) => state.profile);
  const {  loading:postLoading, error:postError ,currentPost} = useSelector((state) => state.posts);

  
  

  useEffect(() => {
    if (user && token) {
      dispatch(fetchProfile({ userId:user.id, token }));
      dispatch(viewPost({ postId, token }));
      
      
    }
  }, [user, token]);
  
  console.log(profile)
  console.log(currentPost)
  console.log(currentPost && currentPost.content);
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
   
        
        fetchComments(postId);
   
    }, [currentPost]);

 const postLike = async  (postId) => {
    dispatch(handleLike({ postId, token ,userId:user.id}));
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
 
  

  const handleAddEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji.native); // Append the selected emoji to the comment text
  };
  
  const toggleBookmark = (postId,isBookmarked) => {
    dispatch(handleBookmark({ postId, token, isBookmarked }));
  };

  if (postLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  

  return (

    
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md overflow-hidden mt-8">
      
      
        <div className="p-4 sm:p-6">
        

        
            <ViewPostBoxComponent 
              post={currentPost}
              user={user}
              handleLike={postLike}
              handleToggleComments={handleToggleComments}
              handleBookmark={toggleBookmark}
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

export default ViewPostPage;
