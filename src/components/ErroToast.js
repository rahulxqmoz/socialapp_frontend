// src/components/ErrorToast.js
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the default styling

const ErrorToast = ({ message }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#F44336', color: 'white', borderRadius: '5px', fontSize: '14px' }}>
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
      <path d="M6 18L18 6M6 6l12 12"></path> {/* X icon */}
    </svg>
    {message}
  </div>
);

// Function to show error toast
export const showErrorToast = (message) => {
  toast(<ErrorToast message={message} />, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    style: { width: 'auto' },
  });
};
