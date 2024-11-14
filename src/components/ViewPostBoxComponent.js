import React, { useEffect, useRef, useState } from 'react'
import { FaSmile, FaTimes  } from 'react-icons/fa';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import CommentItem from './CommentItem';
const ViewPostBoxComponent=({post,user,handleLike,handleToggleComments,handleBookmark,openCommentId,handleSubmitComment,replyingToCommentId,setReplyingToCommentId,
    setCommentText,setShowEmojiPicker,showEmojiPicker,handleAddEmoji,comments,commentText
})=> {
    const emojiPickerRef = useRef(null); 
    const [emojiPickerPosition, setEmojiPickerPosition] = useState('bottom');
    
    
    useEffect(() => {
        if (showEmojiPicker && emojiPickerRef.current) { // Add a null check for emojiPickerRef
          const inputRect = emojiPickerRef.current.getBoundingClientRect(); // Proceed if ref is not null
          const windowHeight = window.innerHeight; // Get the height of the window
          const spaceBelow = windowHeight - inputRect.bottom; // Calculate space below the input field
      
          // If space below is less than 300px (emoji picker height), show above the input field
          if (spaceBelow < 300) {
            setEmojiPickerPosition('top');
          } else {
            setEmojiPickerPosition('bottom');
          }
        }
      }, [showEmojiPicker]);

      if (!post) {
        return <div>Loading...</div>; // Render loading state if currentPost is undefined
      }
     
      
      
    
    
  return (
    <div className="flex justify-center">
      <div className="w-full md:max-w-2xl lg:max-w-4xl mt-6">
        
          <div key={post.id} className="bg-white border border-gray-300 rounded-lg shadow-md mb-6">
            {/* Post Header: Profile picture, Username, and Settings */}
            <div className="flex items-center p-4 justify-between">
              <div className="flex items-center">
                <img
                  src={user.profile_pic || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="font-semibold text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">Posted {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
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
                  className={`flex items-center ${post.liked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}
                  onClick={() => handleLike(post.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={post.liked ? 'red' : 'none'}
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
                  onClick={() => handleToggleComments(post.id)}
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
                onClick={() => handleBookmark(post.id,post.bookmarked)}
              >
                <svg
                  className="w-6 h-6"
                  fill={post.bookmarked ? 'currentColor' : 'none'}
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
                        ref={emojiPickerRef}    
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
                            {showEmojiPicker ? <FaTimes size={20} className="text-red-500" /> : <FaSmile size={20} className="text-gray-500" />}
                        </button>

                        {showEmojiPicker && (
                            <div className={`absolute mt-2 ${emojiPickerPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0`}>
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
      
      </div>
    </div>
  )
}

export default ViewPostBoxComponent
