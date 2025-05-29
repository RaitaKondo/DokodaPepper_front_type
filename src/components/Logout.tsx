// Logout.tsx
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthContext();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await axios.post(
          "http://localhost:8080/api/logout",
          {},
          { withCredentials: true }
        );
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
