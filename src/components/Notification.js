import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '../features/auth/notificationSlice';
import { Link, useNavigate } from 'react-router-dom';

const NotificationList = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state)=>state.user.user)
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
    onClose();
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    onClose();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-lg font-bold mb-4">Notifications</h2>
      <ul>
        {notifications.slice(0, 10).map((notification) => (
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
                  className="w-6 h-6 rounded-full object-cover mr-2"
              />
              {['like', 'comment'].includes(notification.notification_type) ? (
                  <Link to={`/viewpost/${notification.post}`}>
                      <p
                          className={`font-semibold ${
                              notification.notification_type === 'follow' ? 'text-blue-500' : 'text-gray-700'
                          }`}
                      >
                          {notification.sender_username}{' '}
                          {notification.notification_type === 'like'
                              ? 'liked your post'
                              : 'commented on your post'}
                      </p>
                  </Link>
              ) : notification.notification_type === 'follow' ? (
                <Link to={`/followers/${notification.receiver}`}>
                  <p className="font-semibold text-blue-500">
                    {notification.sender_username} followed you
                  </p>
                </Link>
              ) : notification.announcement_content && notification.receiver === user.id ? (
                <p className="font-semibold text-red-500">
                  Announcement: {notification.announcement_content}
                </p>
              ) : (
                <p className="font-semibold text-gray-500">
                  Unknown notification from {notification.sender_username}
                </p>
              )}
          </div>     
         </li>
        ))}
      </ul>
      {notifications.length > 3 && (
        <button
          className="w-full p-4 text-center text-blue-600 hover:bg-gray-200"
          onClick={handleViewAllNotifications}
        >
          View All Notifications
        </button>
      )}
    </div>
  );
};

export default NotificationList;
