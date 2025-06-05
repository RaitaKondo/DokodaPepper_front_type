import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated, fetchUser } = useAuthContext();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get("error");

  const handleLogin = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/login",
        { username, password },
        { withCredentials: true }
      );
      await fetchUser();
      navigate("/");
    } catch (err) {
      alert("ログインに失敗しました");
    }
  };

  return (
    <div>
      {error === "access_denied" && (
        <div className="alert alert-danger">アクセスが拒否されました。</div>
      )}
      {error === "expired" && (
        <div className="alert alert-warning">
          セッションの有効期限が切れました。
        </div>
      )}
      <h2>ログイン</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="ユーザー名"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        type="password"
      />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
};

export default LoginPage;
