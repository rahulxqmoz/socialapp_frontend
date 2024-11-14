import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config'; 


const PasswordResetRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    // Basic email format validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if email is not empty, does not contain spaces, and is in a valid format
    if (!email.trim()) {
      return "Email is required.";
    } else if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/users/password-reset-request/`, { email });
      setMessage(response.data.detail);
      setError('');
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.email &&
        error.response.data.email[0] ===
          "Password reset is not allowed for Google-authenticated users."
      ) {
        setError(
          `Please login through Google Sign-Up. <a href="/login" class="text-blue-500 underline">Go to Login</a>`
        );
        // showErrorToast('Please login through Google Sign-Up.')
      } else {
        setError("An error occurred while resetting your password.");
        // showErrorToast('An error occurred while resetting your password.')
      }
      setMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-6">Request Password Reset</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {error && (
            <p
              className="text-red-600 text-sm mb-4 mt-2"
              dangerouslySetInnerHTML={{ __html: error }} // Allows HTML content in the error message
            />
          )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Request Password Reset
          </button>
        </form>
        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <a href="/login" className="hover:text-blue-500">Back to Signin</a>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequest;
