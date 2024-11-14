// // import { useEffect } from 'react';
// // import { useSelector } from 'react-redux';

// // const useNotifications = (onMessage) => {
// //   const token = useSelector((state) => state.auth.token);
// //   useEffect(() => {
// //     const socket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

// //     socket.onopen = () => {
// //       console.log('WebSocket connection established');
// //     };

// //     socket.onmessage = (event) => {
// //       const notification = JSON.parse(event.data);
// //       onMessage(notification);
// //       console.log(notification);
// //     };

// //     socket.onerror = (error) => {
// //       console.error('WebSocket error:', error);
// //     };

// //     socket.onclose = (event) => {
// //       console.log('WebSocket connection closed:', event);
// //       // Optionally, handle reconnection logic here
// //     };

// //     // Cleanup on component unmount
// //     return () => {
// //       socket.close();
// //     };
// //   }, [onMessage]); // Add onMessage to the dependency array
// // };

// // export default useNotifications;





// import React, { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchNotifications } from '../features/notificationSlice';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBell } from '@fortawesome/free-solid-svg-icons';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const NotificationPopover = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dispatch = useDispatch();
//   const notifications = useSelector((state) => state.notifications.notifications);
//   const status = useSelector((state) => state.notifications.status);
//   const error = useSelector((state) => state.notifications.error);
//   const [localNotifications, setLocalNotifications] = useState([]);
//   const popoverRef = useRef(null);
//   const ws = useRef(null);
//   const navigate = useNavigate(); // Use useNavigate for navigation

//   // Fetch notifications on component mount
//   useEffect(() => {
//     dispatch(fetchNotifications());
//   }, [dispatch]);

//   // Sync Redux state notifications to local state
//   useEffect(() => {
//     console.log("Notifications:", notifications); // Log notifications to check their structure
//     setLocalNotifications(notifications);
//   }, [notifications]);

//   // Setup WebSocket connection for real-time notifications
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const wsUrl = ws://localhost:8000/ws/notifications/?token=${token};

//     ws.current = new WebSocket(wsUrl);

//     ws.current.onopen = () => {
//       console.log('WebSocket connection established');
//     };

//     ws.current.onmessage = (event) => {
//       const newNotification = JSON.parse(event.data);
//       console.log('Received notification:', newNotification);

//       // Update local notifications with the new WebSocket notification
//       setLocalNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
//     };

//     ws.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     ws.current.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     // Cleanup on component unmount
//     return () => {
//       if (ws.current) {
//         ws.current.close();
//       }
//     };
//   }, []);

//   // Handle marking a notification as read and navigating
//   const handleNotificationClick = async (notification) => {
//     if (!notification.is_read) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.patch(http://localhost:8000/api/notifications/${notification.id}/, {}, {
//           headers: {
//             'Authorization': Bearer ${token},
//           },
//         });
//         setLocalNotifications((prev) =>
//           prev.map((notif) =>
//             notif.id === notification.id ? { ...notif, is_read: true } : notif
//           )
//         );
//       } catch (error) {
//         console.error('Failed to mark notification as read:', error);
//       }
//     }

//     // Navigate to the relevant content based on notification type
//     if (notification.type === 'comment') {
//       navigate(/posts/${notification.post_id}#comment-${notification.comment_id});
//     } else if (notification.type === 'like') {
//       navigate(/posts/${notification.post_id});
//     } else if (notification.type === 'post') {
//       navigate(/posts/${notification.post_id});
//     }
//   };

//   const togglePopover = () => {
//     setIsOpen(!isOpen);
//   };

//   // Close popover if clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (popoverRef.current && !popoverRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [popoverRef]);

//   const unreadCount = localNotifications.filter((notif) => !notif.is_read).length;

//   // Base URL for constructing profile picture URLs
//   const baseUrl = "http://localhost:8000"; // Adjust this to your backend URL

//   return (
//     <div className="relative inline-block" ref={popoverRef}>
//       <button onClick={togglePopover} className="relative flex items-center">
//         <FontAwesomeIcon icon={faBell} className="text-blue-600 text-2xl" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full ">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="absolute left-0 mt-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 max-h-[500px] overflow-y-auto" style={{left:'-360px'}}>
//           <h2 className="text-xl font-bold mb-4">Notifications</h2>

//           {status === 'loading' && <div className="text-center py-4">Loading...</div>}
//           {status === 'failed' && <div className="text-center py-4 text-red-500">Error: {error}</div>}

//           {localNotifications.length === 0 ? (
//             <div className="p-4 text-gray-600">No notifications yet.</div>
//           ) : (
//             <ul className="divide-y divide-gray-200">
//               {localNotifications.map((notification) => {
//                 // Construct the full URL for the profile picture
//                 const profilePictureUrl = new URL(notification.sender.profile_picture, baseUrl);

//                 return (
//                   <li
//                     key={notification.id}
//                     className={py-3 px-4 cursor-pointer transition duration-200 ease-in-out ${notification.is_read ? 'bg-gray-100 text-gray-600' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'}}
//                     onClick={() => handleNotificationClick(notification)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         {profilePictureUrl && (
//                           <img
//                             src={profilePictureUrl}
//                             alt="Profile"
//                             className="w-8 h-8 rounded-full mr-2"
//                           />
//                         )}
//                         <div className="text-sm">
//                           <p className="font-semibold">{notification.sender.first_name}</p>
//                           <p>{notification.message}</p>
//                         </div>
//                       </div>
//                       <p className="text-xs text-gray-400">
//                         {new Date(notification.created_at).toLocaleString()}
//                       </p>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationPopover;

