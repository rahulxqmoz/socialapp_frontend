import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approvePost, fetchReportedPosts, suspendPost } from '../features/auth/adminPostSlice';

const AdminPosts = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [reportReason, setReportReason] = useState({});
  const { reportedPosts, loading, error } = useSelector((state) => state.adminPosts);


  useEffect(() => {
    dispatch(fetchReportedPosts({token}));
  }, [dispatch,token]);

  console.log(reportedPosts)
  const handleApprove = (postId) => {
    dispatch(approvePost({ postId,token }))
      
  };

  const handleSuspend = (postId) => {
    const report_reason  = reportReason[postId] || 'No reason provided';
    dispatch(suspendPost({ postId,report_reason,token }))
    setReportReason((prev) => ({ ...prev, [postId]: '' }));
     
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Reported Posts</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reportedPosts.map((post) => (
        <div key={post.post_id} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <img
                src={post.profile_pic || '/default-user.jpg'}
                alt="User Profile"
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{post.user}</h3>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{post.content}</p>

            {post.image ? (
              <img src={post.image} alt="Post Image" className="w-full h-40 object-cover mb-3" />
            ) : post.video ? (
              <video controls className="w-full h-40 object-cover mb-3">
                <source src={post.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : null}

            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <h4 className="text-gray-600 font-bold mb-2">Report Details</h4>
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {post.report_details.reason}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Additional Info:</strong> {post.report_details.additional_info}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Reported By:</strong> {post.report_details.reported_by}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Reported At:</strong> {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Input for Report Reason */}
            <div className="mb-3">
              <label htmlFor={`report-reason-${post.post_id}`} className="block text-gray-700 font-semibold mb-1">
                Suspension Reason:
              </label>
              <input
                type="text"
                id={`report-reason-${post.post_id}`}
                value={reportReason[post.post_id] || ''}
                onChange={(e) => setReportReason((prev) => ({ ...prev, [post.post_id]: e.target.value }))}
                placeholder="Enter reason for suspension"
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => handleApprove(post.post_id)}
                disabled={post.is_approved || !post.is_reported}
                className={`px-3 py-1 rounded ${
                  post.is_approved || !post.is_reported
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                Approve
              </button>

              {/* Suspend Button */}
              <button
                onClick={() => handleSuspend(post.post_id)}
                disabled={post.is_reported && !post.is_approved}
                className={`px-3 py-1 rounded ${
                  post.is_reported && !post.is_approved
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default AdminPosts;
