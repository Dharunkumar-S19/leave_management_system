import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: Checks for auth status and allowed roles
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading Auth...</div>;
  }

  // No token found
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Not authorised for this role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to home dashboard if the user has a different role
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
