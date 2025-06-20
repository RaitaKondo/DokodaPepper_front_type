// Logout.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import api from "../api/api";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthContext();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await api.post("/api/logout", {}, { withCredentials: true });
      } catch (err) {
        console.error("ログアウト失敗", err);
      } finally {
        setIsAuthenticated(false);
        navigate("/login");
      }
    };

    doLogout();
  }, []);

  return <p>ログアウト中...</p>;
};

export default Logout;
