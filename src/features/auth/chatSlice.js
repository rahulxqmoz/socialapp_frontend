import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';


// Thunk to fetch chat rooms
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/chatrooms/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to create a chat room
export const createChatRoom = createAsyncThunk(
    'chat/createChatRoom',
    async ({ roomName, participants, token }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/chatrooms/`,
          { room_name: roomName, participants },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  
// Thunk to fetch messages for a specific room
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ roomName, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/messages/${roomName}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchMessagesGroup = createAsyncThunk(
  'chat/fetchMessagesGroup',
  async ({ roomId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/messages/list-with-id/${roomId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Thunk to send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomName, message, messageType, file, token }, { dispatch ,rejectWithValue}) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('message_type', messageType);
      if (file) {
        formData.append('file', file); // Attach file if present
      }
      const response = await axios.post(
        `${BASE_URL}/api/chat/messages/${roomName}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Ensure form-data for file upload
          },
        }
      );
      const result = response.data;
      console.log(`result of save message:${result.id}`)
      // Dispatch the addMessage action to update the Redux state
      dispatch(addMessage({
        sender: result.sender,
        message: result.message,
        message_type: result.message_type,
        file: result.file,
        timestamp: result.timestamp,
        id:result.id
      }));
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendMessageId = createAsyncThunk(
  'chat/sendMessageId',
  async ({ roomId, message, messageType, file, token }, { dispatch ,rejectWithValue}) => {
    try {
      const formData = new FormData();
      formData.append('room_id', roomId);
      formData.append('message', message);
      formData.append('message_type', messageType);
      if (file) {
        formData.append('file', file); // Attach file if present
      }
      const response = await axios.post(
        `${BASE_URL}/api/chat/messages/create-with-id/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data', // Ensure form-data for file upload
          },
        }
      );
      const result = response.data;
      console.log(`result of save message:${result.id}`)
      // Dispatch the addMessage action to update the Redux state
      dispatch(addMessage({
        sender: result.sender,
        message: result.message,
        message_type: result.message_type,
        file: result.file,
        timestamp: result.timestamp,
        id:result.id
      }));
      return result;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchOlderMessages = createAsyncThunk(
  'chat/fetchOlderMessages',
  async ({ roomName, token, oldestMessageId }, { rejectWithValue }) => {
      try {
          const response = await axios.get(`${BASE_URL}/api/chat/messages/${roomName}/older/${oldestMessageId}/`, {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          return response.data; // Return older messages
      } catch (err) {
          return rejectWithValue(err.response?.data || err.message);
      }
  }
);

export const fetchUnreadCounts = createAsyncThunk(
  'chat/fetchUnreadCounts',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/chat/unread_counts/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    messages: [],
    unreadMessages: {},
    loading: false,
    error: null,
  },
  reducers: {
    addMessage: (state, action) => {
        console.log("Message added to Redux:", action.payload); 
        const existingMessage = state.messages.find(msg => msg.id === action.payload.id);
        if (existingMessage) {
          console.log("MESSAGE READ ENTERED IN ADDMESSAGE"); 
            // Update existing message
            Object.assign(existingMessage, action.payload);
        } else {
            // Add new message
            state.messages.push(action.payload);
        }
      },
    resetMessages: (state) => {
        state.messages = [];
      },
    updateMessages: (state, action) => {
      state.messages = state.messages.map((msg) => {
        if (msg.id === action.payload.message_id) {
            return {
                ...msg,
                read_by: action.payload.read_by,  // Update only the read_by field
            };
        }
        return msg;  // Keep other messages unchanged
        });
      },
      updateUnreadCounts: (state, action) => {
        state.unreadMessages = {
          ...state.unreadMessages,
          ...action.payload // Merging existing unread counts with new data
        };
      },
     
    },
    extraReducers: (builder) => {
    // Handling chat room fetch
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Handling chat room creation
    builder
      .addCase(createChatRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms.push(action.payload);
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Handling messages fetch
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      builder
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = [...state.messages, 
          ...action.payload.filter(newMsg => !state.messages.find(msg => msg.id === newMsg.id))];
      })

      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

      builder
      .addCase(fetchMessagesGroup.pending, (state) => {
        state.loading = true;
      })
      builder
      .addCase(fetchMessagesGroup.fulfilled, (state, action) => {
        state.messages = [...state.messages, 
          ...action.payload.filter(newMsg => !state.messages.find(msg => msg.id === newMsg.id))];
      })

      .addCase(fetchMessagesGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

    // Handling message send
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        //state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });

      builder
      .addCase(sendMessageId.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessageId.fulfilled, (state, action) => {
        state.loading = false;
        //state.messages.push(action.payload);
      })
      .addCase(sendMessageId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
    builder
      .addCase(fetchOlderMessages.fulfilled, (state, action) => {
          state.messages = [...action.payload, ...state.messages]; // Prepend older messages
      });
      builder
      .addCase(fetchUnreadCounts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnreadCounts.fulfilled, (state, action) => {
        state.unreadMessages = action.payload;
        state.loading = false;
      })
      .addCase(fetchUnreadCounts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});
export const { addMessage,resetMessages,updateMessages,updateUnreadCounts } = chatSlice.actions;
export default chatSlice.reducer;
