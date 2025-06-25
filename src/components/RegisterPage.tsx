import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      await api.post(
        "/api/register",
        { username, password },
        { withCredentials: true }
      );
      setIsAuthenticated(true); // 自動ログイン
      console.log("登録成功、遷移待機中...");
      navigate("/"); // 登録成功後にトップページへ（自動ログイン済み）
    } catch (err) {
      alert("登録に失敗しました");
    }
  };

  return (
    <div>
      <h2>新規登録</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="ユーザー名 半角英数字のみ"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード 半角英数字のみ"
        type="password"
      />
      {isLoading ? (
        <p>登録中...</p>
      ) : (
        <button onClick={handleRegister}>登録</button>
      )}
    </div>
  );
};

export default RegisterPage;
