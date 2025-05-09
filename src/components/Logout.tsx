// LogoutButton.tsx
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/logout',
        {}, // ボディは空でOK
        { withCredentials: true } // セッションCookie送信
      );
      // ログアウト成功 → ログインページへ遷移
      navigate('/login');
    } catch (err) {
      alert('ログアウトに失敗しました');
      console.error(err);
    }
  };

  return <button onClick={handleLogout}>ログアウト</button>;
};

export default Logout;
