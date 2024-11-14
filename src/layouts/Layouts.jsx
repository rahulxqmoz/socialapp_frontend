import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaHome, FaUser, FaBookmark, FaCog, FaSignOutAlt, FaBell,FaFacebookMessenger,FaComments  } from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/userSlice';
import SearchBar from '../components/SearchBar';
import Suggestion from '../components/SuggestionComponent';
import { fetchSuggestions } from '../features/auth/suggestionSlice';
import { RingLoader, FadeLoader } from 'react-spinners';
//import useNotifications from '../components/NotificationService';
import NotificationList from '../components/Notification';
import { Badge,ClickAwayListener  } from '@mui/material';
import { fetchNotifications } from '../features/auth/notificationSlice';
import { toast } from 'react-toastify';
import { fetchUnreadCounts, updateUnreadCounts } from '../features/auth/chatSlice';
import './Layout.css'
import CallNotificationModal from '../components/CallNotificationModal';
import { declineCall } from '../features/auth/groupChatSlice';
import { setCaller, setCallerId, setOffer, setStatus } from '../features/auth/callSlice';
import { showErrorToast } from '../components/ErroToast';
const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { suggestions: userSuggestions, loading: isLoading, error: fetchError } = useSelector((state) => state.suggestions);
  const notificationsRef = useRef(null); // Reference for notifications dropdown
  const { notifications:unreadNotifications = [] } = useSelector((state) => state.notifications);
  const unreadCount = unreadNotifications.filter(notification => !notification.is_read).length;
  const unreadCounts = useSelector((state) => state.chat.unreadMessages||{});
  const [animateUnreadCount, setAnimateUnreadCount] = useState(false);
  let totalUnreadCount=unreadCounts ? Object.values(unreadCounts).reduce((sum, count) => sum + count, 0) : 0;
  const [lastUnreadCount, setLastUnreadCount] = useState(totalUnreadCount); 
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callerName, setCallerName] = useState('');
  const [call_id, setCallId] = useState(null);
  const caller_id = useSelector((state) => state.call.caller_id);
 
  
  const userId = user ? user.id : null;
  
  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      showErrorToast('Session time out!Please login again!!')
      navigate('/login');
    }
  }, [user, navigate]);
 
  useEffect(() => {
    // Fetch followers when component loads
    if (token) {
      //fetchUnreadCounts();
      dispatch(fetchUnreadCounts({token}))
    }
  }, [token,user]);

  useEffect(() => {
    if (user && token) {
      dispatch(fetchSuggestions(token));
    }
  }, [user, token, dispatch]);

  useEffect(() => {
    // Fetch notifications when the component mounts
    if(user && token){
    dispatch(fetchNotifications({ token }));
  }
  }, [dispatch, token]);

  
  

  useEffect(() => {
   
    const ws = new WebSocket(`ws://connectifyapp.xyz/ws/notifications/${userId}/`);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(`data announcement:${data.announcement,data.receiver}`)
        // Display toast notification
        if (data.notification_type==='follow'){
          toast.info(`New notification: ${data.sender} has followed you.`);
        }
        else if (data.notification_type==='like'){
          toast.info(`New notification: ${data.sender} ${data.notification_type} your post.`);
        }
        else if (data.notification_type==='comment'){
          toast.info(`New notification: ${data.sender} ${data.notification_type} your post.`);
        }
        else{
            
            if (data.announcement && data.receiver===userId){
              toast.info(`Alert!! ${data.announcement}.`);
            }
        }
        dispatch(fetchNotifications({ token }));
        // Optionally, add notification to the state
        setNotifications(prev => [data, ...prev]);
    };

    return () => {
        ws.close();
    };
  }, [userId]);

  useEffect(() => {
    // Setup WebSocket connection for real-time unread counts
    if (user && token){
    const wsUrl = `ws://connectifyapp.xyz/ws/unreadnotifications/${user.id}/?token=${token}`;
    const notificationSocket = new WebSocket(wsUrl);

    notificationSocket.onopen = () => {
      console.log("WebSocket connected for notifications Layout");
    };

    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "unread_counts") {
        dispatch(updateUnreadCounts(data.unread_counts[user.id]));
        totalUnreadCount = Object.values(data.unread_counts[user.id]).reduce((sum, count) => sum + count, 0);
      }
    };

    notificationSocket.onclose = (event) => {
      console.error("WebSocket closed unexpectedly");
    };
  
    return () => {
      notificationSocket.close();
    };
  }
  }, [dispatch]);

  useEffect(() => {
    if (totalUnreadCount > lastUnreadCount) {
      setAnimateUnreadCount(true);
      setTimeout(() => setAnimateUnreadCount(false), 1000);
    }
    setLastUnreadCount(totalUnreadCount); // Update last count
  }, [totalUnreadCount]);

 

  useEffect(() => {
    const callSocket = new WebSocket(`ws://connectifyapp.xyz/ws/call/${userId}/?token=${token}`);

    callSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`websocket data:${data},status:${data.status},caller_id:${data.caller_id}`)
      if (data.type === 'call_notification' && data.status === 'pending') {
        dispatch(setCaller(data.caller));
        setIsCallModalOpen(true);
        setCallId(data.call_id);
        dispatch(setCallerId(data.caller_id));
        dispatch(setStatus(data.status))
        dispatch(setOffer(data.offer))


      }
    };

    callSocket.onclose = () => {
      console.error("Call WebSocket closed unexpectedly");
    };

    return () => {
      callSocket.close();
    };
  }, [userId]);

  
  const handleAcceptCall = () => {
    setIsCallModalOpen(false);
    navigate(`/video-call/${caller_id}`);
  };

  // Handler to decline call
  const handleDeclineCall = () => {
    dispatch(declineCall({callId:call_id,token}))
    setIsCallModalOpen(false);
    
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const toggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
      setIsNotificationsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  if (!user) {
    return null;  // Prevents further rendering if user is not authenticated
  }
  const handleLogout = () => {
    console.log("entered logout");
  dispatch(logout());
  console.log("Dispatch completed not");
  navigate('/login');
  console.log("Navigation attempted");
  };
  const handleClickAway = () => {
    setIsNotificationsOpen(false);
  };
 

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-white text-gray-800 w-64 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out z-50 shadow-lg`}
      >
        {/* Sidebar header with logo and profile */}
        <div className="p-4 border-b flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold ml-2">Connectify</h1>
          </div>

          {/* Close button (visible only on small and medium screens) */}
          <button className="lg:hidden text-gray-800" onClick={toggleSidebar}>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col border-b items-center p-4">
          <img
            src={user?.profile_pic || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <h2 className="mt-3 text-lg font-semibold">{user?.username || 'John Doe'}</h2>
        </div>

        {/* Sidebar Links */}
        <nav className="mt-4 space-y-1 flex-1 overflow-auto">
          <a
            href="/home"
            className="flex items-center p-2 hover:bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaHome className="mr-3" /> Home
          </a>
          <a
            href="/profile"
            className="flex items-center p-2 hover:bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaUser className="mr-3" /> Profile
          </a>
          <a
            href="/messages"
            className="flex items-center p-2 hover:bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaFacebookMessenger className="mr-3" /> Messages
            {totalUnreadCount > 0 && (
            <span
            className={`ml-2 bg-red-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center ${
              animateUnreadCount ? 'unread-count-animate' : ''
            }`}
          >
            {totalUnreadCount}
          </span>
          )}
          </a>
          <a
            href="/groupchat"
            className="flex items-center p-2 hover:bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
             <FaComments className="mr-3" /> Group Chats
          </a>
          <a
            href="/bookmarks"
            className="flex items-center p-2 hover:bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaBookmark className="mr-3" /> Bookmarks
          </a>
          <a
            href="/settings"
            className="flex items-center p-2 hover:bg-gray-200 rounded-md"
            onClick={() => setIsSidebarOpen(false)}
          >
            <FaCog className="mr-3" /> Settings
          </a>
          <button
            onClick={() => {
              handleLogout();
              setIsSidebarOpen(false);
            }}
            className="flex items-center p-2 hover:bg-gray-200 w-full rounded-md"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`flex flex-col flex-grow transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        } lg:ml-64`} 
      >
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-md fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-4">
          {/* Left Side - Hamburger Menu (Hidden on larger screens) */}
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-gray-800 lg:hidden mr-4">
              <FaBars />
            </button>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-md">
            <SearchBar />
          </div>

          {/* Right Side - Notifications and User Profile */}
          <div className="flex items-center space-x-6 relative">
            <ClickAwayListener onClickAway={handleClickAway}>
              <div className="relative">
                <button onClick={toggleNotifications} className="text-gray-800 relative">
                  <Badge badgeContent={unreadCount} color="error" overlap="rectangular">
                    <FaBell size={24} />
                  </Badge>
                </button>
                {isNotificationsOpen && (
                  <div
                    className="absolute right-0 mt-2 w-96 h-60 bg-white shadow-lg rounded-lg p-2 z-40"
                    style={{ maxHeight: '600px', overflowY: 'auto' }}
                  >
                    <NotificationList
                      notifications={notifications}
                      onClose={() => setIsNotificationsOpen(false)}
                    />
                  </div>
                )}
              </div>
            </ClickAwayListener>
            <img
              src={user?.profile_pic || 'https://via.placeholder.com/30'}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </header>
      

        {/* Main Feed Area */}
        {location.pathname === '/messages' ? (
          <main className="mt-16 flex-grow p-4 md:p-6 bg-gray-100 overflow-auto flex">
             <div className="flex-1 max-w-full pr-2 md:w-full">
           <Outlet />
           </div>
          </main>
        ) : (
          <main className="mt-16 flex-grow p-4 md:p-6 bg-gray-100 overflow-auto flex flex-col md:flex-row">
            <div className="flex-1 max-w-3xl pr-2 md:w-2/3">
              <Outlet />
            </div>
            {(location.pathname === '/home' || location.pathname === '/profile') && (
              <div className="bg-white shadow-md rounded-md overflow-hidden mt-8 md:mt-8 md:w-1/3 w-full sm:max-w-sm mx-auto p-2">
                {isLoading ? (
                  <div className="flex items-center justify-center p-6">
                    <RingLoader color="#4A90E2" size={60} />
                    <p className="ml-4">Loading suggestions...</p>
                  </div>
                ) : fetchError ? (
                  <div className="flex items-center justify-center p-6">
                    <FadeLoader color="#E74C3C" height={15} width={5} />
                    <p className="ml-4 text-red-500">Error fetching suggestions</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                  
                   
                      <Suggestion suggestions={userSuggestions} />
                   
                  </div>
                )}
              </div>
            )}
          </main>
        )}
      </div>
      <>
      {/* Your existing layout code */}
      
      {location.pathname !== `/video-call/${caller_id}` && (
        <CallNotificationModal
          open={isCallModalOpen}
          caller={callerName}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}
    </>
    </div>
  );
};

export default Layout;
