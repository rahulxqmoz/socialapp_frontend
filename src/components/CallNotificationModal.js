import React from 'react';
import { Modal } from '@mui/material';

const CallNotificationModal = ({ open, caller, onAccept, onDecline }) => {
    return (
      <Modal
        open={open}
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
      >
        <div className="bg-white rounded-lg shadow-lg w-80 sm:w-96 p-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Incoming Call from <span className="text-indigo-600">{caller}</span>
          </h3>
          <div className="flex justify-between space-x-4">
            <button
              onClick={onAccept}
              className="w-full bg-green-500 text-white font-semibold py-2 rounded-lg transition duration-300 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Redirect to Page
            </button>
            <button
              onClick={onDecline}
              className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg transition duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Decline
            </button>
          </div>
        </div>
      </Modal>
    );
  };
  
  export default CallNotificationModal;
  