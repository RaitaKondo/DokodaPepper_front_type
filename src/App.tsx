import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Logout from './components/Logout';
import Layout from './components/boilerTemplates/Layout';
import Home from './components/Home';
import PostDetail from './components/boilerTemplates/PostDetail';
import NewPost from './components/NewPost';

const App: React.FC = () => {
  return (
    <div className="App">
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/post_new" element={<NewPost />} />
      </Routes>

      </ Layout>
    </div>
  );
}

export default App;
