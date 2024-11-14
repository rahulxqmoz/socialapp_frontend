// src/components/CustomToast.js
import React from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the default styling

const CustomToast = ({ message }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px', backgroundColor: '#4CAF50', color: 'white', borderRadius: '5px', fontSize: '14px' }}>
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
      {message}
    </div>
  );
};

// Function to show success toast
export const showSuccessToast = (message) => {
  toast(<CustomToast message={message} />, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    style: { width: 'auto' },
  });
};
