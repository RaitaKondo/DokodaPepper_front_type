import React from 'react';
import { Post } from '../types/Types';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="card" style={{ width: '18rem', margin: '1rem' }}>
      {post.images.length > 0 && (
        // <img src={post.images[0].imageUrl} className="card-img-top" alt="投稿画像" />
        <img src={post.images[0].imageUrl} className="card-img-top" alt="投稿画像" />
      )}
      <div className="card-body">
        <h5 className="card-title">{post.user.username}（{post.area.name}）</h5>
        <p className="card-text">{post.content}</p>
        <p className="card-text">
          <small className="text-muted">投稿日: {new Date(post.createdAt).toLocaleString()}</small>
        </p>
      </div>
    </div>
  );
};

export default PostCard;
