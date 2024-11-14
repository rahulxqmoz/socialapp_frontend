import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../features/auth/notificationSlice';
import { Link, useNavigate } from 'react-router-dom';

const AllNotificationsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const { notifications: notificationsFromStore = [], loading, error } = useSelector((state) => state.notifications);

  // Local state for notifications
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications when the component mounts
    dispatch(fetchNotifications({ token }));
  }, [dispatch, token]);

  // Update local notifications when the store updates
  useEffect(() => {
    setNotifications(notificationsFromStore);
  }, [notificationsFromStore]);

  const handleNotificationClick = (notificationId) => {
    // Mark the notification as read when clicked
    dispatch(markNotificationAsRead({ notificationId, token }));

    // Update local notifications state
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      )
    );
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

 
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }
  
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Notifications</h1>
      <ul>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 border-b text-gray-800 cursor-pointer ${
                notification.is_read ? 'bg-gray-100' : 'bg-white'
              }`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="flex items-center">
                <img
                  src={notification.sender_profile_pic || 'https://via.placeholder.com/800x500'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover mr-3"
                />
                {(() => {
              if (notification.notification_type === 'follow') {
                return (
                  <Link to={`/followers/${notification.receiver}`}>
                    <p className="font-semibold text-blue-500">
                      {notification.sender_username} followed you
                    </p>
                  </Link>
                );
              } else if (notification.notification_type === 'like') {
                return (
                  <Link to={`/viewpost/${notification.post}`}>
                    <p className="font-semibold text-gray-700">
                      {notification.sender_username} liked your post
                    </p>
                  </Link>
                );
              } else if (notification.notification_type === 'comment') {
                return (
                  <Link to={`/viewpost/${notification.post}`}>
                    <p className="font-semibold text-gray-700">
                      {notification.sender_username} commented on your post
                    </p>
                  </Link>
                );
              } else if (notification.announcement_content && notification.receiver === user.id) {
                return (
                  <p className="font-semibold text-red-500">
                    Announcement: {notification.announcement_content}
                  </p>
                );
              } else {
                return (
                  <p className="font-semibold text-gray-500">
                    Unknown notification from {notification.sender_username}
                  </p>
                );
              }
            })()}
              </div>
            </li>
          ))
        ) : (
          <div>No notifications found.</div>
        )}
      </ul>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleBackToHome}
      >
        Back to Home
      </button>
    </div>
  );
};

export default AllNotificationsPage;
