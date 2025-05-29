import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isLoggedIn }) => {
  const role = localStorage.getItem('role');
  console.log('ProtectedRoute - isLoggedIn:', isLoggedIn, 'role:', role);

  if (!isLoggedIn || role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
