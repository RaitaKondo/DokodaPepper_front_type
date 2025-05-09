import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./logics/useAuth";

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return <p>確認中...</p>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
