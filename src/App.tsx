import { AuthProvider } from './components/AuthContext';
import AppRoutes from './components/AppRoutes';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
