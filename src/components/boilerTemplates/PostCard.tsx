import React from "react";
import { Post } from "../types/Types";
import { useNavigate } from "react-router-dom";

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post.postId}`, { state: { post } }); // ← postオブジェクト渡す
  };

  return (
    <div
      className="card"
      onClick={handleClick}
      style={{ margin: "1rem", width: "100%" }}
    >
      <div className="d-flex flex-column align-items-center">
        {post.images.length > 0 && (
          <img
            src={`http://localhost:8080${post.images[0].imageUrl}`}
            className="card-img-top img-fluid"
            alt="投稿画像"
            style={{ maxWidth: "100%", height: "auto", objectFit: "cover" }}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{post.city.name}</h5>
          <p className="card-text">{post.userName}</p>
          <p className="card-text">
            <small className="text-muted">
              投稿日: {new Date(post.createdAt).toLocaleString()}
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
