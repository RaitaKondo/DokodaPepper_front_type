// components/logics/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type UserInfo = {
  id: number;
  username: string;
};

type AuthContextType = {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (auth: boolean) => void;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/user", { withCredentials: true })
      .then((res) => {
        setIsAuthenticated(true);
        setUser(res.data);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used inside AuthProvider");
  console.log(context);
  return context;
};
