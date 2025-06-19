import React, { useState } from "react";
import axios from "axios";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthContext();

  const handleRegister = async () => {
    try {
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
        placeholder="ユーザー名"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
        type="password"
      />
      <button onClick={handleRegister}>登録</button>
    </div>
  );
};

export default RegisterPage;
