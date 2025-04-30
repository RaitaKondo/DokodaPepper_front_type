// App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Login: React.FC = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/test', { withCredentials: true }) // ← CORS対策で必要になる場合あり
      .then(res => setMessage(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-primary">Spring Boot says:</h1>
      <p>{message}</p>
    </div>
  );
};

export default Login;
