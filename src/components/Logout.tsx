import React, { useState } from 'react';
import axios from 'axios';

const Logout: React.FC = () => {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/logout', {}, {
        withCredentials: true
      });
      window.location.href = 'http://localhost:8080'; // ← ここでリダイレクト！
    } catch (err) {
      console.error('ログアウト失敗:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <button type="submit" className="btn btn-primary">Logout</button>
    </form>
  );
};

export default Logout;
