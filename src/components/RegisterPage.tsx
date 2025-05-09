import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/register',
        { username, password },
        { withCredentials: true }
      );
      navigate('/'); // 登録成功後にトップページへ（自動ログイン済み）
    } catch (err) {
      alert('登録に失敗しました');
    }
  };

  return (
    <div>
      <h2>新規登録</h2>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ユーザー名" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" type="password" />
      <button onClick={handleRegister}>登録</button>
    </div>
  );
};

export default RegisterPage;
