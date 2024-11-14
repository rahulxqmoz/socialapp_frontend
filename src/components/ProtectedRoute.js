// src/components/ProtectedRoute.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAdminRoute }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);

  if (!isAuthenticated) {
    // If the user is not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  if (isAdminRoute && !user?.is_admin) {
    // If the route is admin only and the user is not an admin, redirect to the home page
    return <Navigate to="/" />;
  }

  // If the user is authenticated and has the necessary privileges, render the child component
  return children;
};

export default ProtectedRoute;
