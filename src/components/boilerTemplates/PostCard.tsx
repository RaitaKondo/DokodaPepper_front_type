import { useState } from "react";
import { Post } from "../types/Types";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/ai"; // ← これが重要！

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/posts/${post.postId}`, { state: { post } }); // ← postオブジェクト渡す
  };

  // const foundIt = post.foundIt;
  const foundIt = post.foundIt;
  const report = post.reported;

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
          <h5 className="card-title">{post.content}</h5>
          <p className="card-title">{post.address}</p>
          <p className="card-text">{post.userName}</p>
          <p className="card-text">
            {foundIt ? (
              <FaIcons.AiFillSmile className="text-warning" />
            ) : (
              <FaIcons.AiOutlineSmile />
            )}
            {post.numberOfFoundIt}/
            {report ? (
              <FaIcons.AiFillMeh className="text-success" />
            ) : (
              <FaIcons.AiOutlineMeh />
            )}
            {post.numberOfReported}
          </p>
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
