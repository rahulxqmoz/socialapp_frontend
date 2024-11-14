import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, createChatRoom, fetchChatRooms, fetchMessages,fetchUnreadCounts,sendMessage } from '../features/auth/chatSlice';
import { FaSmile, FaTimes,FaPaperclip,FaVideo  } from 'react-icons/fa'; // Emoji toggle icons
import Picker from '@emoji-mart/react'; // Emoji picker component
import data from '@emoji-mart/data';
import MessageComponent from './MessageComponent';
import {useNavigate } from 'react-router-dom';
const ChatDialog = ({ roomName, user }) => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const messages = useSelector((state) => state.chat.messages||[]);
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const socketRef = useRef(null); // Using useRef for socket
    const chatRooms = useSelector((state) => state.chat.rooms);
    const currentUser = useSelector((state) => state.user.user);
    const messagesEndRef = useRef(null);
    const [file, setFile] = useState(null);
    const [messageType, setMessageType] = useState('text');
    const [filePreview, setFilePreview] = useState(null);
    const navigate=useNavigate();

  const markMessagesAsReads = (messageId) => {

    const message = messages.find(msg => msg.id === messageId);
    if (message && !message.read_by.includes(currentUser.id)) {
        //message.read_by.push(currentUser.id);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'message_read',
                message_id: messageId,
                user_id: currentUser.id,
            }));
          
        }
    }
};

const startVideoCall =()=>{

    navigate(`/video-call/${user.id}`);

}

    useEffect(() => {
        if (roomName && token) {

            dispatch({ type: 'chat/resetMessages' });
            // Step 1: Fetch all chat rooms to check if the room exists
            dispatch(fetchChatRooms({ token })).then((action) => {
                const roomExists = chatRooms?.some(room => room.name === roomName);

                if (roomExists) {
                    // Room exists, fetch messages for this room
                    dispatch(fetchMessages({ roomName, token }));
                    
                } else {
                    // Room doesn't exist, create it first
                    dispatch(createChatRoom({ roomName,participants:[user.id,currentUser.id], token }))
                        .then(() => {
                            // After creating the room, fetch the messages
                            dispatch(fetchMessages({ roomName, token }));
                        });
                }
            });
        }
       // WebSocket connection setup
        socketRef.current = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/?token=${token}`);

        socketRef.current.onopen = () => {
            console.log("WebSocket connection opened");
        };
        
      
        socketRef.current.onmessage = async (e) => {
          const data = JSON.parse(e.data);
          console.log("WebSocket data received:", data);
          console.log("Current messages in state:", messages);

         

        if (data.type === 'message_read') {
                console.log(`messgae read entered:${data.message_id}`)
                console.log("Current messages in state message_read:", messages);
                // Update the specific message's read_by list
                const updatedMessages = messages.map((msg) => {
                    if (msg.id === data.message_id) {
                        return {
                            ...msg,
                            // Directly use the updated 'read_by' array from the WebSocket event
                            read_by: data.read_by, 
                        };
                    }
                    return msg;
                });
            
                // Dispatch the action to update the messages array in the Redux store
                dispatch({
                    type: 'chat/updateMessages',
                    payload: {
                        message_id: data.message_id,  // Identify the specific message
                        read_by: data.read_by,        // Provide the updated read_by array
                    },
                });
                dispatch(fetchUnreadCounts({ token }));
                
            } else if (data.message && data.sender) {
                const existingMessage = messages.find(msg => msg.id === data.message_id);
                if (!existingMessage) {
              dispatch(addMessage({
                  sender: data.sender,
                  message: data.message,
                  message_type: data.message_type,
                  file: data.file,
                  timestamp: data.timestamp || new Date().toISOString(),
                  id: data.message_id,  // Include the message ID
                  read_by: data.read_by || []
              }));
              dispatch(fetchUnreadCounts({token}))
            }
          }else if (data.file && data.sender) {
            const existingMessage = messages.find(msg => msg.id === data.message_id);
            if (!existingMessage) {
            dispatch(addMessage({
                sender: data.sender,
                message: data.message,
                message_type: data.message_type,
                file: data.file,
                timestamp: data.timestamp || new Date().toISOString(),
                id: data.message_id,  // Include the message ID
                read_by: data.read_by || []
            }));
        }
        }
      };

        
        socketRef.current.onclose = (event) => {
            console.log('WebSocket closed. Attempting to reconnect...');
            console.error("WebSocket closed unexpectedly:", event.reason);
        };
        

        return () => {
            socketRef.current.close();
        };
    }, [roomName, token, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        messages.forEach(msg => {
            if (msg.sender !== currentUser.id && !msg.read_by.includes(currentUser.id)) {
                console.log(`entered markMeaa`)
                markMessagesAsReads(msg.id);
                dispatch(fetchUnreadCounts({token}))
                
            }
        });
    }, [messages]);

    const handleSendMessage = async  () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
            const result = await dispatch(sendMessage({ roomName, message:messageInput, messageType, file, token })).unwrap();
            console.log(`result:${result}`)
            console.log(`result id:${result.id}`)
            socketRef.current.send(JSON.stringify({
                type: 'message_sent',
                sender: currentUser.id,
                recipient_id: user.id, 
                message_id: result.id, 
                timestamp: new Date().toISOString(),
              }));
            dispatch(fetchUnreadCounts({token}))
            setMessageInput('');
            setFile(null);
            setMessageType('text'); 
          } catch (err) {
            console.error(err);
          }
        }
     
    };

    const formatTimestamp = (timestamp) => { 
        const date = new Date(timestamp);
        
        // Format the date (day/month/year)
        const formattedDate = date.toLocaleDateString([], {
            day: '2-digit', 
            month: 'short',  // e.g., 'Jan', 'Feb'
            year: 'numeric'
        });
    
        // Format the time (hour:minute AM/PM)
        const formattedTime = date.toLocaleTimeString([], {
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true
        });
    
        return `${formattedDate}, ${formattedTime}`;
    };
    

    const handleAddEmoji = (emoji) => {
      setMessageInput(prevInput => prevInput + emoji.native); // Append emoji to message input
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        const fileType = selectedFile.type;
        const maxVideoSize = 100 * 1024 * 1024; 
        // Set message type based on the file type
        if (fileType.startsWith('image/')) {
            setMessageType('image');
            setFilePreview(URL.createObjectURL(selectedFile)); // Preview the image
        } else if (fileType === 'image/gif') {
            setMessageType('gif');
            setFilePreview(URL.createObjectURL(selectedFile)); // Preview the GIF
        } else if (fileType.startsWith('video/')) {
            if (selectedFile.size > maxVideoSize) {
                alert('Video file size must be smaller than 100MB.');
                return; 
            }
            setMessageType('video');
            setFilePreview(URL.createObjectURL(selectedFile)); // Preview the video
        } else {
            setMessageType('file');
            setFilePreview(null); // No preview for other file types
        }
    }
};
  
    return (
        <div className="flex flex-col h-full border-2 border-gray-300 rounded-lg shadow-lg ">
        {/* Header */}
        <div className="flex items-center p-4 bg-blue-500 text-white sticky top-0 z-10 rounded-md">
          <img
            src={user.profile_pic || 'https://via.placeholder.com/800x500'}
            alt={user.username}
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <span className="text-lg font-semibold">{user.username}</span>
          <div className={`ml-2 w-3 h-3 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="ml-1 text-sm">
                    {user.is_online ? 'Online' : 'Offline'}
                </span>
                <button 
                  onClick={startVideoCall} 
                  className="ml-auto text-white bg-green-500 rounded-full p-2"
                >
                 <FaVideo size={20}></FaVideo   >
                </button>
        </div>

            {/* File Preview Section */}
            {filePreview && (
                <div className="flex items-center justify-center p-4 border-b">
                  
                    {messageType === 'image' && (
                        <img src={filePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    )}
                    {messageType === 'video' && (
                        <video src={filePreview} controls className="w-32 h-32 object-cover rounded-lg" />
                    )}
                    {messageType === 'gif' && (
                        <img src={filePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    )}
                    <button
                        onClick={() => {
                            setFile(null);
                            setFilePreview(null);
                            setMessageType('');
                        }}
                        className="ml-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition duration-200"
                        aria-label="Close Preview"
                    >
                        <span className="text-lg">✕</span> {/* Larger icon for visibility */}
                    </button>
                </div>
            )}
        <MessageComponent messages={messages} currentUser={currentUser} user={user} formatTimestamp={formatTimestamp} messagesEndRef={messagesEndRef} />
        {/* Message input */}
        <div className="flex items-center p-2 border-t bg-white">
               {/* Emoji Picker Button */}
               <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-500 hover:text-gray-800 mr-2"
                >
                    {showEmojiPicker ? <FaTimes size={20} /> : <FaSmile size={20} />}
                </button>

                {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-10">
                        <Picker data={data} onEmojiSelect={handleAddEmoji} />
                    </div>
                )}
                
          <input
            type="text"
            className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
          />
          <label className="ml-2">
                    <FaPaperclip size={20} />
                    <input type="file" onChange={handleFileChange} className="hidden" accept="image/*,video/*,.gif" />
            </label>
            
          <button
            onClick={handleSendMessage}
            className="ml-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition duration-200"
          >
            Send
          </button>
        </div>

      

      </div>
      
    );
};

export default ChatDialog;
