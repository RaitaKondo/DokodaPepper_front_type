import React from 'react';
import { Routes, Route ,Navigate} from 'react-router-dom';
import './App.css';
import Logout from './components/Logout';
import Layout from './components/boilerTemplates/Layout';
import Home from './components/Home';
import PostDetail from './components/boilerTemplates/PostDetail';
import NewPost from './components/NewPost';
import LoginPage from './components/Login';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './components/logics/useAuth';
import  NotFound  from './components/NotFound';

const App: React.FC = () => {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return <p>確認中...</p>;
  }
  return (
    <div className="App">
      <Layout>
      <Routes>
                {/* 👇 どのルートにもマッチしない場合はリダイレクト */}
                <Route path="*" element={
                  isAuthenticated?< NotFound />
                  :<Navigate to="/login" />
                  } />
        <Route path="/" element={
          < ProtectedRoute >
          <Home /> 
          </ProtectedRoute>
        }/>
        <Route path="/post_new" element={
          < ProtectedRoute >
          <NewPost /> 
          </ProtectedRoute>
        }/>

        <Route path="/logout" element={
                    < ProtectedRoute >
                    <Logout /> 
                    </ProtectedRoute>
                  }/>
        {/* <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" />
        : <LoginPage />} /> */}

        < Route path='/login' element={<LoginPage/>} />

        <Route path="/register" element={
          isAuthenticated? < Navigate to="/" /> 
          : <RegisterPage />} />

      </Routes>

      </ Layout>
    </div>
  );
}

export default App;
