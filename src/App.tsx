import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Logout from './components/Logout';
import Layout from './components/boilerTemplates/Layout';
import Home from './components/Home';
import PostDetail from './components/boilerTemplates/PostDetail';


const App: React.FC = () => {
  return (
    <div className="App">
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/posts/:id" element={<PostDetail />} /> */}
      </Routes>

      </ Layout>
    </div>
  );
}

export default App;
