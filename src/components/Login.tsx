import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthContext();

  const handleLogin = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/login',
        { username, password },
        { withCredentials: true }
      );
      console.log("ログイン成功、遷移待機中...");
setTimeout(() => {
  setIsAuthenticated(true);
  console.log("トップページへ遷移");
  navigate('/');
}, 200); // ログイン成功時にトップページへ
    } catch (err) {
      alert('ログインに失敗しました');
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ユーザー名" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" type="password" />
      <button onClick={handleLogin}>ログイン</button>
    </div>
  );
};

export default LoginPage;
