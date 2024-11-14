// CommentsSection.js
import React from 'react';
import CommentItem from './CommentItem';

const CommentsSection = ({
  postId,
  comments,
  newComment,
  setNewComment,
  handleSubmitComment,
  replyingToCommentId,
  setReplyingToCommentId,
  openRepliesId,
  setOpenRepliesId,
}) => {
  return (
    <div className="comments-section">
      {comments[postId]?.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          handleSubmitComment={handleSubmitComment}
          newComment={newComment}
          setNewComment={setNewComment}
          replyingToCommentId={replyingToCommentId}
          setReplyingToCommentId={setReplyingToCommentId}
          openRepliesId={openRepliesId}
          setOpenRepliesId={setOpenRepliesId}
        />
      ))}
    </div>
  );
};

export default CommentsSection;
