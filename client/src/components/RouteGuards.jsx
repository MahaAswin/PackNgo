import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

export function CustomerOnly({ children }) {
  const { isAuthenticated, isCustomer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isCustomer) return <Navigate to="/" replace />;
  return children;
}

export function AdminOnly({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export function PackagerOnly({ children }) {
  const { isAuthenticated, isPackager } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isPackager) return <Navigate to="/" replace />;
  return children;
}
