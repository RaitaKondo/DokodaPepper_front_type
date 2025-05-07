// App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from './boilerTemplates/PostCard';
import { User } from './types/Types';
import { Post } from './types/Types';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get<Post[]>('http://localhost:8080/api/all');
        console.log(response.data);
        setPosts(response.data);
      } catch (error) {
        console.error('投稿データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (!posts) return <div>投稿が見つかりません</div>;


  return (
    <div className="card" style={{ width: '18rem' }}>
      {/* {post.images.length > 0 && (
        <img src={post.images[0].imageUrl} className="card-img-top" alt="投稿画像" />
      )} */}
      <div className="card-body">
      <div className="container mt-4 d-flex flex-wrap">
      {posts.map((p) => (
  <PostCard key={p.id} post={p} />
))}

    </div>
      </div>
    </div>
  );
};

export default Home;
