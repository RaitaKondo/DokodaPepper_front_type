import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Logout from "./Logout";
import Layout from "./boilerTemplates/Layout";
import Home from "./Home";
import PostDetail from "./boilerTemplates/PostDetail";
import LoginPage from "./Login";
import RegisterPage from "./RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./NotFound";
import { useAuthContext } from "./AuthContext";
import NewPostForm from "./NewPostForm";
import EditPostForm from "./EditPostForm";

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated === null) return <p>確認中...</p>;

  return (
    <div className="App">
      <Layout>
        <Routes>
          {/* 👇 どのルートにもマッチしない場合はリダイレクト */}
          <Route
            path="*"
            element={isAuthenticated ? <NotFound /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/:id/edit"
            element={
              <ProtectedRoute>
                <EditPostForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post_new"
            element={
              <ProtectedRoute>
                <NewPostForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logout"
            element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
          />
          {/* < Route path='/login' element={<LoginPage/>} /> */}
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
          />
        </Routes>
      </Layout>
    </div>
  );
};

export default AppRoutes;
