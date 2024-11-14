import React, { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { FaSmile, FaTimes } from 'react-icons/fa';

const CommentItem = ({ comment, postId, handleSubmitComment, replyingToCommentId, setReplyingToCommentId }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyText, setReplyText] = useState('');

    const handleAddEmoji = (emoji) => {
        setReplyText((prev) => prev + emoji.native); // Append the selected emoji to the reply text
    };

    return (
        <div className="mb-4">
            <p className="text-gray-600">
                <strong>{comment.username}:</strong> {comment.content}
            </p>

            {/* Reply Button */}
            <button
                className="text-sm text-blue-500 hover:underline"
                onClick={() => setReplyingToCommentId(comment.id)}
            >
                Reply
            </button>

            {/* Render replies recursively */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="ml-4 mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId}
                            handleSubmitComment={handleSubmitComment}
                            replyingToCommentId={replyingToCommentId}
                            setReplyingToCommentId={setReplyingToCommentId}
                        />
                    ))}
                </div>
            )}

            {/* Reply Form for this specific comment */}
            {replyingToCommentId === comment.id && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (replyText.trim()) {
                            handleSubmitComment(postId, replyText, comment.id); // Pass comment.id as parentId
                            setReplyText(''); // Clear the input field after submitting
                            setReplyingToCommentId(null); // Close the reply form after submitting
                        }
                    }}
                    className="relative" // Added for positioning the emoji button
                >
                    <input
                        type="text"
                        name="reply"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)} // Update replyText on input change
                        placeholder="Write a reply..."
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
                        Post Reply
                    </button>
                    <button
                        type="button"
                        className="text-sm text-red-500 hover:underline ml-2"
                        onClick={() => setReplyingToCommentId(null)} // Close reply form
                    >
                        Close
                    </button>
                </form>
            )}
        </div>
    );
};

export default CommentItem;
