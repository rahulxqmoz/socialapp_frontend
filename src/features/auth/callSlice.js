// src/features/call/callSlice.js
import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    offer: '',
    caller_id: null,
    status:'',
    caller:'',
  },
  reducers: {
    setOffer: (state, action) => {
      state.offer = action.payload;
    },
    setCallerId: (state, action) => {
      state.caller_id = action.payload;
    },
    setStatus: (state, action) => {
        state.status = action.payload;
    },
    setCaller: (state, action) => {
        state.caller = action.payload;
    },
  },
});

export const { setOffer, setCallerId,setStatus,setCaller } = callSlice.actions;

export default callSlice.reducer;
