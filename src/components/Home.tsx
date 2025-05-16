// App.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostCard from './boilerTemplates/PostCard';
import { User } from './types/Types';
import { Post } from './types/Types';
import { Carousel } from 'react-bootstrap';
import { PageResponse } from './types/Types';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchPost = async (page: number) => {
    try {
      const response = await axios.get<PageResponse<Post>>('http://localhost:8080/api/posts?page=' + page);
      // console.log(response.data.content);
      console.log(response);
      setPosts(response.data.content);
      setTotalPages(response.data.totalPages); // 総ページ数を取得
    } catch (error) {
      console.error('投稿データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);   // ローディング画面を再表示
    fetchPost(page);
  }, [page]);

  // 3件ずつ分割する関数
// const chunkArray = (arr: Post[], size: number): Post[][] => {
//   const result: Post[][] = [];
//   for (let i = 0; i < arr.length; i += size) {
//     result.push(arr.slice(i, i + size));
//   }
//   return result;
// };

// const chunks = chunkArray(posts, 3); // 3枚ずつ分割

  if (loading) return <div>読み込み中...</div>;
  if (posts.length === 0) return <div>投稿が見つかりません</div>;



  return (
    <div className="card" style={{ width: '80vw', border: 'none' }}>
      {/* {post.images.length > 0 && (
        <img src={post.images[0].imageUrl} className="card-img-top" alt="投稿画像" />
      )} */}
      <div className="card-body">
      <div className="container mt-4 ">
        <h1 className="text-center mb-4">最新投稿</h1>

        <div className="row">
          {posts.map((post) => (
            <div className="col-md-4 mb-4 d-flex justify-content-center" key={post.id}>
              <PostCard post={post} />
            </div>
          ))}
        </div>

    </div>
    {/* <button onClick={fetchPost}>再読み込み</button> */}
    <div>
    <button disabled={page === 0} onClick={() => setPage(page - 1)}>前</button>
        <span>{page + 1} / {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>次</button>
      </div>
      </div>
      
    </div>
  );
};

export default Home;
