import React, { useEffect, useRef,useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchRoom } from '../features/auth/groupChatSlice';
import { addMessage, fetchMessagesGroup, sendMessageId } from '../features/auth/chatSlice';
import Picker from '@emoji-mart/react'; // Emoji picker component
import { FaSmile, FaPaperclip } from 'react-icons/fa';
import ParticipantModal from '../components/ParticipantModal';

const GroupChatBox = () => {
  const { roomId } = useParams(); 
  const token = useSelector((state)=>state.auth.token)  
  const user = useSelector((state)=>state.user.user)  
  const dispatch = useDispatch();
  const { group, loading, error } = useSelector((state) => state.groupChat);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messages = useSelector((state) => state.chat.messages);
  const [messageType, setMessageType] = useState('text');
  const [filePreview, setFilePreview] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const socketRef = useRef(null); 



const markMessagesAsRead = (messageId) => {

    const message = messages.find(msg => msg.id === messageId);
    if (message && !message.read_by.includes(user.id)) {
        //message.read_by.push(currentUser.id);
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'message_read',
                message_id: messageId,
                user_id: user.id,
            }));
          
        }
    }
};

  useEffect(() => {
    dispatch(fetchRoom({ roomId,token }));
  }, [dispatch, token]);

  useEffect(() => {
    if (roomId) {
        if(group){
      dispatch(fetchMessagesGroup({ roomId, token }));
    }
    }
  }, [dispatch, roomId, token]);

  useEffect(() => {
    if (roomId && token) {
       
      // Establish WebSocket connection
      socketRef.current =new WebSocket(`ws://localhost:8000/ws/groupchat/${roomId}/?token=${token}`);  // Adjust based on your backend server URL
    

      socketRef.current.onopen = () => {
        console.log('WebSocket connection opened for groupchat.');
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(`websocket data recieved:${data}`)
        if(data.message && data.sender){
            const existingMessage = messages.find(msg => msg.id === data.message_id);
            if (!existingMessage) {
            dispatch(addMessage({
                sender: data.sender,
                message: data.message,
                message_type: data.message_type,
                file: data.file,
                timestamp: data.timestamp || new Date().toISOString(),
                id: data.message_id,  // Include the message ID
                read_by: data.read_by || [],
                sender_profile_pic:data.sender_profile_pic,
                sender_username:data.sender_username
            }));
            
          
        }
        }
        
        else if (data.file && data.sender) {
            const existingMessage = messages.find(msg => msg.id === data.message_id);
            if (!existingMessage) {
            dispatch(addMessage({
                sender: data.sender,
                message: data.message,
                message_type: data.message_type,
                file: data.file,
                timestamp: data.timestamp || new Date().toISOString(),
                id: data.message_id,  // Include the message ID
                read_by: data.read_by || [],
                sender_profile_pic:data.sender_profile_pic,
                sender_username:data.sender_username
            }));
        }
        }
        else if (data.type === 'message_read') {
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
          
            
        }
     };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed.');
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [dispatch, roomId, group]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  useEffect(() => {
    if (messages && messages.length > 0) { 
    messages.forEach(msg => {
        if (msg.sender !== user.id && !msg.read_by.includes(user.id)) {
            console.log(`entered markMeaa`)
            markMessagesAsRead(msg.id);
           
            
        }
    });
  }
}, [messages]);

useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);

  // Load older messages when scrolling to the top
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0) {
      //dispatch(loadOlderMessages({ roomId, token }));
    }
  };

  const handleSendMessage = async () => {

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        try {
            const result = await dispatch(sendMessageId({ roomId : group.id, message:messageInput, messageType, file, token })).unwrap();
            console.log(`result:${result}`)
            console.log(`result id:${result.id}`)
            socketRef.current.send(JSON.stringify({
                type: 'message_sent',
                message: messageInput || '', // Ensure message is sent as empty if not provided
                message_type: messageType,
                sender: user.id,
                timestamp: new Date().toISOString(),
                message_id: result.id // Include message ID
              }));
            //dispatch(fetchUnreadCounts({token}))
            setMessageInput('');
            setFile(null);
            setMessageType('text'); 
          } catch (err) {
            console.error(err);
          }
        }
     
  };

  const handleAddEmoji = (emoji) => {
    setMessageInput((prev) => prev + emoji.native);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
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
 
  const handleViewParticipants = (participants) => {
    setSelectedParticipants(participants);
    setShowParticipantsModal(true);
  };

  const closeParticipantsModal = () => {
    setShowParticipantsModal(false);
    setSelectedParticipants([]);
  };
  const renderReadStatus = (msg) => {
    const readBy = msg.read_by || [];
    const isOnlyUserRead = msg.sender === user.id && readBy.length === 0;
    const isReadByOthers = readBy.length > 1 || (readBy.length === 1 && readBy[0] !== user.id);

    if (isOnlyUserRead) {
      return <span className="text-blue-600">Sent ✓</span>; // Double tick
    }
    if (isReadByOthers) {
      return <span className="text-green-500">Seen ✓✓</span>; // Green seen
    }
    return <span className="text-blue-600">Read ✓✓</span>; // Green seennull; // No read receipt
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="group-chat-box max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
    <div className="chat-header bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-4 flex items-center justify-between shadow-md rounded-t-lg">
    {group && group.group_name ? (
        <>
        <div className="flex flex-col">
            <h2 className="text-2xl font-bold tracking-wide">{group.group_name}</h2>
            <span className="text-sm text-gray-200 mt-1">Group chat</span>
        </div>
        <button
            onClick={() => handleViewParticipants(group.participants)}
            className="bg-white text-blue-500 font-medium px-4 py-2 rounded-full shadow-sm transition transform hover:scale-105 hover:bg-blue-50"
        >
            View Participants
        </button>
        </>
    ) : (
        <h2 className="text-2xl font-bold">Chat Room Details Not Available</h2>
    )}
    </div>



     <div className="messages-container px-4 py-2 space-y-4 flex-1 overflow-y-auto" ref={messagesContainerRef}   onScroll={handleScroll}>
        {messages?.map((msg) => (
         <div
         key={msg.id}
         className={`message p-3 rounded-lg shadow-md max-w-[50%] ${
           user.id === msg.sender ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
         }`}
         style={{
            maxWidth: '50%',
            marginLeft: user.id === msg.sender ? 'auto' : '0',
          }}
        >
            <div className="flex items-center mb-1">
              {msg.sender_profile_pic && (
                <img src={msg.sender_profile_pic} alt="Profile" className="w-8 h-8 rounded-full mr-2 object-cover" />
              )}
              <span className="text-sm font-semibold text-gray-600">{msg.sender_username}</span>
            </div>
            <div className="message-text text-gray-900">
              {msg.message_type === 'text' ? (
                <span>{msg.message}</span>
              ) : msg.file ? (
                <>
                  {msg.message_type === 'image' ? (
                    <img src={msg.file} alt="Image" className="max-w-full w-[300px] h-auto object-cover rounded-lg shadow-md" />
                  ) : msg.message_type === 'video' ? (
                    <video src={msg.file} controls className="max-w-full w-[300px] h-auto rounded-lg shadow-md" />
                  ) : msg.message_type === 'gif' ? (
                    <img src={msg.file} alt="GIF" className="max-w-full w-[300px] h-auto object-cover rounded-lg shadow-md" />
                  ) : (
                    <span>No file available</span>
                  )}
                </>
              ) : (
                <span>No message available</span>
              )}
            </div>
            <div className="read-status mt-1">
              {renderReadStatus(msg)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
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

  <div className="input-container bg-gray-50 flex items-center px-4 py-3 border-t space-x-2">
    <div className="relative emoji-picker-container">
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <Picker onEmojiSelect={handleAddEmoji} />
        </div>
      )}
      <button
        className="text-xl text-gray-600 hover:text-blue-500"
        onClick={() => setShowEmojiPicker((prev) => !prev)}
      >
        <FaSmile />
      </button>
    </div>

    <input
      type="text"
      value={messageInput}
      onChange={(e) => setMessageInput(e.target.value)}
      placeholder="Type your message..."
      className="message-input flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <input
      type="file"
      onChange={handleFileChange}
      className="hidden"
      id="file-upload"
      accept="image/*,video/*,.gif"
    />
    <label
      htmlFor="file-upload"
      className="cursor-pointer text-xl text-gray-600 hover:text-blue-500"
    >
      <FaPaperclip />
    </label>

    <button
      onClick={handleSendMessage}
      className="send-button bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none"
    >
      Send
    </button>
  </div>
  <ParticipantModal
         isOpen={showParticipantsModal}
         onClose={closeParticipantsModal}
         participants={selectedParticipants}
      />
</div>


  );
};

export default GroupChatBox;
