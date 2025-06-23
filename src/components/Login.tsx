import React, { useState } from "react";
import api from "../api/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const { setIsAuthenticated, fetchUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const error = params.get("error");

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await api.post(
        "/api/login",
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
        placeholder="ユーザー名 半角英数字のみ"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード  半角英数字のみ"
        type="password"
      />
      {isLoading ? (
        <p>ログイン中</p>
      ) : (
        <button onClick={handleLogin}>ログイン</button>
      )}
    </div>
  );
};

export default LoginPage;
