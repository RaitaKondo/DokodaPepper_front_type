// App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from './boilerTemplates/PostCard';
import { User } from './types/Types';
import { Post } from './types/Types';
import { Carousel } from 'react-bootstrap';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPost = async () => {
    try {
      const response = await axios.get<Post[]>('http://localhost:8080/api/getForTop');
      console.log(response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('投稿データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);   // ローディング画面を再表示
    fetchPost();
  }, []);

  // 3件ずつ分割する関数
const chunkArray = (arr: Post[], size: number): Post[][] => {
  const result: Post[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const chunks = chunkArray(posts, 3); // 3枚ずつ分割

  if (loading) return <div>読み込み中...</div>;
  if (posts.length === 0) return <div>投稿が見つかりません</div>;



  return (
    <div className="card" style={{ width: '60vw' }}>
      {/* {post.images.length > 0 && (
        <img src={post.images[0].imageUrl} className="card-img-top" alt="投稿画像" />
      )} */}
      <div className="card-body">
      <div className="container mt-4 ">
        <h1 className="text-center mb-4">最新投稿</h1>

        <Carousel interval={null}>
        {chunks.map((group, index) => (
          <Carousel.Item key={index}>
            <div className="row justify-content-center">
              {group.map((post) => (
                <div className="col-md-4 d-flex justify-content-center" key={post.id}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

    </div>
    {/* <button onClick={fetchPost}>再読み込み</button> */}

      </div>
    </div>
  );
};

export default Home;
