import axios from 'axios';

console.log("API URL:", process.env.REACT_APP_API_URL);
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // 必要ならcookieセッションなどにも対応
});

export default api;
