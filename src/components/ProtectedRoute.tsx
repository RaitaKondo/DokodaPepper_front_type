import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { JSX } from 'react';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated === null) return <p>確認中...</p>;

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
