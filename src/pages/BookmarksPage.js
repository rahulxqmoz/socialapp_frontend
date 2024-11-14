import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import CommentItem from '../components/CommentItem';
import { showErrorToast } from '../components/ErroToast';
import { showSuccessToast } from '../components/CustomToast';
import { FaSmile, FaTimes } from 'react-icons/fa';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { BASE_URL } from '../config';
const BookmarksPage = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [openCommentId, setOpenCommentId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null); 
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.user.user);
  const [bookmarkPosts, setbookmarkPosts] = useState({}); 

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookmarks`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      }); 
      const formattedPosts = response.data.map((bookmark) => {
        return {
            id: bookmark.post.id,
          content: bookmark.post.content,
          image: bookmark.post.image,
          video: bookmark.post.video,
          created_at: bookmark.post.created_at,
          total_likes: bookmark.post.total_likes,
          total_comments: bookmark.post.total_comments,
          user: {
            userId: bookmark.post.user.id,  // Access user data from bookmark.post.user
            username: bookmark.post.user.username,
            bio: bookmark.post.user.bio,
            profile_pic: bookmark.post.user.profile_pic,
            cover_pic: bookmark.post.user.cover_pic,
          },
        };
      });
      
      // Set the formatted posts to state
      setPosts(formattedPosts);
      console.log(formattedPosts);
      
      
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      console.log(`calling feetchcomments:${postId}`)
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

 
  useEffect(()=>{
    if (user && token) {
        fetchBookmarks();
      }
  },[user,token])



  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach((post) => {
        console.log(`Correct post id for comments: ${post.id}`);
        fetchComments(post.id);
      });
    }
  }, [posts]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const likeStatuses = {};
        for (let post of posts) {
          const response = await fetch(`${BASE_URL}/api/posts/${post.id}/check_liked/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            likeStatuses[post.id] = result.liked; // Assume the response contains { liked: true/false }
            console.log('check liked');
            console.log(result);
          }
        }
        setLikedPosts(likeStatuses);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };
    const fetchBookmarkStatus = async () => {
      try {
        const bookmarkPosts = {};
        for (let post of posts) {
          const response = await fetch(`${BASE_URL}/api/posts/${post.id}/check_bookmarked/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            bookmarkPosts[post.id] = result.bookmarked; // Assume the response contains { liked: true/false }
           
          }
        }
        setbookmarkPosts(bookmarkPosts);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };
    
    fetchLikeStatus();
    fetchBookmarkStatus();
  }, [posts, token]);

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
     
      showSuccessToast("Comment submitted successfully");
     
    } catch (error) {
      showErrorToast("Error submitting comment");
    }
  };

  const handleAddEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji.native); // Append the selected emoji to the comment text
  };
  const handleBookmark = async (postId) => {
    try {
      
      if (bookmarkPosts[postId]) {
        // If already bookmarked, unbookmark the post
        await axios.delete(`${BASE_URL}/api/bookmarks/${postId}`,{
          headers: {
              Authorization: `Bearer ${token}`,
          },
        });
        setbookmarkPosts((prevState) => ({
          ...prevState,
          [postId]: false,
        }));
        showErrorToast('Post removed from Bookmarks');
      } else {
        // If not bookmarked, bookmark the post
        await axios.post(`${BASE_URL}/api/bookmarks/`, { post: postId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setbookmarkPosts((prevState) => ({
          ...prevState,
          [postId]: true,
        }));
        showSuccessToast('Added to Bookmarks');
      }
     
    } catch (error) {
      console.error('Error updating bookmark:', error);
    }
  };
  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/likes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId }),
      });

      if (response.status === 201) {
        setLikedPosts((prev) => ({ ...prev, [postId]: true }));
        showSuccessToast('Post liked');
      } else if (response.status === 204) {
        setLikedPosts((prev) => ({ ...prev, [postId]: false }));
        showSuccessToast('Post unliked');
      }
     
    } catch (error) {
      showErrorToast('Error liking/unliking post');
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md overflow-hidden mt-8">
       

        <div className="flex justify-center">
        <div className="w-full md:max-w-2xl lg:max-w-4xl mt-6 p-3">
        <div className="flex justify-normal my-8">
        <h2 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-slate-900 to-slate-700 text-transparent bg-clip-text">Bookmarks</h2>
        </div>
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-300 rounded-lg shadow-md mb-6">
            {/* Post Header: Profile picture and Username */}
            <div className="flex items-center p-4">
              <img
                src={post.user.profile_pic || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="font-semibold text-gray-800">{post.user.username}</p>
                <p className="text-sm text-gray-500">Posted {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4">
              {post.content && <p className="text-gray-800 mb-3">{post.content}</p>}
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="rounded-lg mt-2 w-full h-auto object-cover"
                />
              )}
              {post.video && (
                <video
                  src={post.video}
                  controls
                  className="rounded-lg mt-2 w-full h-auto"
                />
              )}
            </div>

            {/* Post Footer: Like, Comment, Bookmark */}
            <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <button
                  className={`flex items-center ${likedPosts[post.id] ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}
                  onClick={() => handleLike(post.id)} // Like/unlike post on click
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={likedPosts[post.id] ? 'red' : 'none'} // Fill heart if liked
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </svg>
                  {post.total_likes === 0 ? 'Like' : <span>{post.total_likes}</span>}
                </button>

                {/* Comment Button */}
                <button
                  className="flex items-center text-gray-600 hover:text-blue-500"
                  onClick={() => handleToggleComments(post.id)} // Toggle comments on click
                >
                     
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-6 h-6 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 8h10M7 12h7m-7 4h10m0 6v-6h4v8.59a1.5 1.5 0 01-2.29 1.25L18 21H6a1 1 0 01-1-1V4a1 1 0 011-1h12v2H6v16h10z"
                    />
                  </svg>
                  {post.total_comments === 0 ? 'Comment' : <span>{post.total_comments}</span>}
                  
                </button>
              </div>

              {/* Bookmark Button */}
              <button
                className="text-gray-600 hover:text-blue-500"
                onClick={() => handleBookmark(post.id)} // Call the bookmark handler
              >
                <svg
                  className="w-6 h-6"
                  fill={bookmarkPosts[post.id] ? 'currentColor' : 'none'} // Conditional fill
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 5v15l7-5 7 5V5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            
        {/* Comment Section */}
        {openCommentId === post.id && (
                <div className="p-4 border-t border-gray-200">
                    {/* List Existing Comments */}
                    {comments[post.id] && comments[post.id].length > 0 ? (
                        comments[post.id].map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                postId={post.id}
                                handleSubmitComment={handleSubmitComment}
                                replyingToCommentId={replyingToCommentId}
                                setReplyingToCommentId={setReplyingToCommentId}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                    )}

                    {/* Comment Form for the post */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (commentText.trim()) {
                                handleSubmitComment(post.id, commentText); // No parentId means it's a top-level comment
                                setCommentText(''); // Clear the input field after submitting
                            }
                        }}
                        className="relative" // Added for positioning the emoji button
                    >
                        <input
                            type="text"
                            name="comment"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)} // Update commentText on input change
                            placeholder="Write a comment..."
                            className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute right-2 top-2 text-gray-500 hover:text-gray-800"
                        >
                            {showEmojiPicker ? (
                                <FaTimes size={20} className="text-red-500" />
                            ) : (
                                <FaSmile size={20} className="text-gray-500" />
                            )}
                        </button>

                        {showEmojiPicker && (
                            <div className="absolute mt-12 right-0">
                                <Picker data={data} onEmojiSelect={handleAddEmoji} />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="bg-blue-500 text-white mt-2 px-4 py-2 rounded-lg"
                        >
                            Post Comment
                        </button>
                    </form>
                </div>
            )}


                </div>
                ))}
            </div>
            </div>
      
    </div>
  )
}

export default BookmarksPage
