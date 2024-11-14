import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import { fetchFeed, updatePostLikes, updatePostBookmarks } from '../features/auth/feedSlice';
import FeedPostComponent from '../components/FeedPostComponent';
import axios from 'axios';
import { BASE_URL } from '../config';
import { showSuccessToast } from '../components/CustomToast';
import { showErrorToast } from '../components/ErroToast';
import { ClipLoader } from 'react-spinners'; 
import { useNavigate } from 'react-router-dom';
const FeedPage = () => {
  console.log(`entered`)
 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { posts, loading, error, hasMore } = useSelector((state) => state.feed);
  const user = useSelector((state) => state.user.user);
  console.log(user)
  const token = useSelector((state) => state.auth.token);
  const bookmarkPosts = useSelector((state) => state.bookmarkPosts);
  const [openCommentId, setOpenCommentId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const likedPosts = useSelector((state) => state.likedPosts);
  const [page, setPage] = useState(1);
 
  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
 

  useEffect(() => {
    dispatch(fetchFeed({ token, page }));
  }, [dispatch, token, page]);

 
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
    if (posts.length > 0) {
      posts.forEach((post) => {
        console.log(`Correct post id: ${post.id}`);
        fetchComments(post.id);
      });
    }
  }, [posts]);

  if (!user) {
    return null;  // Prevents further rendering if user is not authenticated
  }
  

  const fetchMoreData = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
      dispatch(fetchFeed({ token, page: page + 1 }));
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ClipLoader size={50} color={"#123abc"} loading={loading} />
      </div>
    );
  }
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const postLike = async (postId) => {
    //dispatch(handleLike({ postId, token, userId: user.id }));
    dispatch(updatePostLikes({postId, token, userId:user.id  }));
  };

  const handleToggleComments = (postId) => {
    if (openCommentId === postId) {
      setOpenCommentId(null); // Close the comments section if it's already open
    } else {
      setOpenCommentId(postId); // Open the comments section for the specific post
    }
  };

  const toggleBookmark = (postId,isBookmarked) => {
    //const isBookmarked = bookmarkPosts[postId];
    //dispatch(handleBookmark({ postId, token, isBookmarked }));
    dispatch(updatePostBookmarks({ postId, token, isBookmarked}));
  };

  const handleSubmitComment = async (postId, commentText, parentId = null) => {
    if (!commentText.trim()) {
      showErrorToast('Empty Comment Box');
      return;
    }
    console.log(postId, commentText, user.id, parentId, token);
    try {
      const response = await axios.post(`${BASE_URL}/api/comments/`, {
        post: postId,
        content: commentText,
        user: user.id,
        parent: parentId,
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
      dispatch(fetchFeed({ token, page: 1 })); // Reload the feed to get updated comments
      setNewComment('');
      setReplyingToCommentId(null);

      showSuccessToast('Comment submitted successfully');
    } catch (error) {
      showErrorToast('Error submitting comment');
    }
  };

  const handleAddEmoji = (emoji) => {
    setCommentText((prev) => prev + emoji.native);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md overflow-hidden mt-8 p-3">
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={ <div className="flex justify-center items-center mt-8 mb-8 h-24">
        <ClipLoader size={45} color={"#0d6efd"} loading={loading} />
       </div>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>You have seen all posts!</b>
          </p>
        }
      >
        <FeedPostComponent
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
        />
      </InfiniteScroll>
    </div>
  );
};

export default FeedPage;
