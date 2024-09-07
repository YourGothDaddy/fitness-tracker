import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";

function ProtectedRoute({ children, isForAdmin }) {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isForAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default ProtectedRoute;
