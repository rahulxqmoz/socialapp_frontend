import React from 'react';
import Modal from 'react-modal'; // Assuming you are using 'react-modal' for the modal implementation

// Make sure to set the app root for accessibility reasons with react-modal
Modal.setAppElement('#root');

const ParticipantModal = ({ isOpen, onClose, participants }) => {
  return (
    <Modal
    isOpen={isOpen}
    onRequestClose={onClose}
    className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
    overlayClassName="fixed inset-0 bg-gray-900 bg-opacity-50"
    contentLabel="Participants Modal"
  >
    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto space-y-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Participants</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &times;
        </button>
      </div>
      <ul className="space-y-2">
        {participants.map((participant) => (
          <li key={participant.id} className="flex items-center space-x-3">
            <img
              src={participant.profile_pic || 'https://via.placeholder.com/40'}
              alt={participant.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-gray-800 font-medium">{participant.username}</span>
          </li>
        ))}
      </ul>
    </div>
  </Modal>
  );
};

export default ParticipantModal;
