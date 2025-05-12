import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuthContext();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/logout', {}, { withCredentials: true });
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      alert('ログアウトに失敗しました');
      console.error(err);
    }
  };

  return <button onClick={handleLogout}>ログアウト</button>;
};

export default Logout;
