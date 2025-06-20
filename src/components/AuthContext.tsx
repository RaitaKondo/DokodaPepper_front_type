// components/logics/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

type UserInfo = {
  id: number;
  username: string;
};

type AuthContextType = {
  isAuthenticated: boolean | null;
  setIsAuthenticated: (auth: boolean) => void;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/user", {
        withCredentials: true,
      });
      setUser(res.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser, fetchUser }}
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
