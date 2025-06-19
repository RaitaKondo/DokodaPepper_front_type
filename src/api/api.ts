import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  // baseURL: "https://dokodapepper-api.onrender.com/",
  withCredentials: true, // 必要ならcookieセッションなどにも対応
});

export default api;
