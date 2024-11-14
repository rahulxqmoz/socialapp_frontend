import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { BASE_URL } from '../../config';
// Thunk to create a new group

export const createGroup = createAsyncThunk(
    'groupChat/createGroup',
    async ({ groupName, members, token }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/chatrooms/create-group/`,
          { group_name: groupName,participants :members },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
// Thunk to fetch user groups
export const fetchUserGroups = createAsyncThunk(
    'groupChat/fetchUserGroups',
    async ({ token }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${BASE_URL}/api/chat/chatrooms/user-groups/`, {
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
// Thunk to leave a group
export const leaveGroup = createAsyncThunk(
    'groupChat/leaveGroup',
    async ({ groupId, token }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/chatrooms/${groupId}/leave-group/`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  export const fetchRoom = createAsyncThunk(
    'groupChat/fetchRoom',
    async ({ roomId, token }, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${BASE_URL}/api/chat/chatrooms/${roomId}/`, {
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



  export const initiateCall = createAsyncThunk(
    'groupChat/initiateCall',
    async ({ recipientId, token,offer }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/initiate_call/`,
          { recipient_id: recipientId,offer:offer }, // Aligning with the API view's expectation
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
     
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  
  // Thunk to accept a call
  export const acceptCall = createAsyncThunk(
    'groupChat/acceptCall',
    async ({ callId, token }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/accept_call/${callId}/`, // Sending callId as a URL parameter
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  
  // Thunk to decline a call
  export const declineCall = createAsyncThunk(
    'groupChat/declineCall',
    async ({ callId, token }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/decline_call/${callId}/`, // Sending callId as a URL parameter
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );
  
  // Thunk to end a call
  export const endCall = createAsyncThunk(
    'groupChat/endCall',
    async ({ callId, token }, { rejectWithValue }) => {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/chat/end_call/${callId}/`, // Sending callId as a URL parameter
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (err) {
        return rejectWithValue(err.response?.data || err.message);
      }
    }
  );

  const groupChatSlice = createSlice({
    name: 'groupChat',
    initialState: {
      groups: [], // New state for groups
      group: {},
      loading: false,
      error: null,
      call_request : null,
    },
    reducers: {
  
    },
    extraReducers: (builder) => {
      // Handling create group
      builder
        .addCase(createGroup.pending, (state) => {
          state.loading = true;
        })
        .addCase(createGroup.fulfilled, (state, action) => {
          state.loading = false;
          state.groups.push(action.payload);
        })
        .addCase(createGroup.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      // Handling fetch user groups
      builder
        .addCase(fetchUserGroups.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchUserGroups.fulfilled, (state, action) => {
          state.loading = false;
          state.groups = action.payload;
        })
        .addCase(fetchUserGroups.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      // Handling leave group
      builder
        .addCase(leaveGroup.pending, (state) => {
          state.loading = true;
        })
        .addCase(leaveGroup.fulfilled, (state, action) => {
          state.loading = false;
          state.groups = state.groups.filter((group) => group.id !== action.meta.arg.groupId);
        })
        .addCase(leaveGroup.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });

        builder
        .addCase(fetchRoom.pending, (state) => {
          state.loading = true;
        })
        .addCase(fetchRoom.fulfilled, (state, action) => {
          state.loading = false;
          state.group = action.payload;
        })
        .addCase(fetchRoom.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });

        builder
        .addCase(initiateCall.pending, (state) => {
          state.loading = true;
        })
        .addCase(initiateCall.fulfilled, (state,action) => {
          state.loading = false;
          state.call_request = action.payload.call_request;
        })
        .addCase(initiateCall.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      builder
        .addCase(acceptCall.pending, (state) => {
          state.loading = true;
        })
        .addCase(acceptCall.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(acceptCall.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      builder
        .addCase(declineCall.pending, (state) => {
          state.loading = true;
        })
        .addCase(declineCall.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(declineCall.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
  
      builder
        .addCase(endCall.pending, (state) => {
          state.loading = true;
        })
        .addCase(endCall.fulfilled, (state) => {
          state.loading = false;
        })
        .addCase(endCall.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload.message;
        });
   
  
      
    },
  });
  

  export default groupChatSlice.reducer;
  