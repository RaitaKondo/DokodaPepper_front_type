import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Post, Comment } from "../types/Types";
import { useEffect, useState } from "react";
import api from "../../api/api";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import {
  Card,
  Container,
  Row,
  Col,
  Carousel,
  Button,
  Alert,
} from "react-bootstrap";
import { useAuthContext } from "../AuthContext";
import * as FaIcons from "react-icons/ai"; // ← これが重要！
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const PostDetail: React.FC = () => {
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(state?.post ?? null);
  const { user } = useAuthContext();

  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
  });

  const [foundCount, setFoundCount] = useState<number>(
    post?.numberOfFoundIt ?? 0
  );

  const [foundIt, setFoundIt] = useState<boolean>(post!.foundIt);

  const [reportedCount, setReportedCount] = useState<number>(
    post?.numberOfReported ?? 0
  );

  const [reported, setReported] = useState<boolean>(post!.reported);

  const navigate = useNavigate();

  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState<string>("");

  const [message, setMessage] = useState<string | null>(null);

  const handleFound = () => {
    api
      .post(`/api/posts/${id}/found`)
      .then((res) => {
        const toggle = !foundIt;

        setFoundIt(toggle);
        setFoundCount((prev) => (toggle ? prev + 1 : prev - 1));

        const postData = sessionStorage.getItem("posts");
        if (!postData) return;

        // JSONをパース
        const posts: Post[] = JSON.parse(postData);

        // 対象のpostを探して更新
        const updatedPosts = posts.map((p) =>
          p.postId === post?.postId ? { ...p, foundIt: !p.foundIt } : p
        );

        // 再度JSONとして保存
        sessionStorage.setItem("posts", JSON.stringify(updatedPosts));
      })
      .catch((error) => (window.location.href = "/login?error=expired"));
  };

  const handleReport = () => {
    api
      .post(`/api/posts/${id}/report`)
      .then(() => {
        const toggle = !reported;
        setReported(toggle);
        setReportedCount((prev) => (toggle ? prev + 1 : prev - 1));

        const postData = sessionStorage.getItem("posts");
        if (!postData) return;

        // JSONをパース
        const posts: Post[] = JSON.parse(postData);

        // 対象のpostを探して更新
        const updatedPosts = posts.map((p) =>
          p.postId === post?.postId ? { ...p, reported: !p.reported } : p
        );

        // 再度JSONとして保存
        sessionStorage.setItem("posts", JSON.stringify(updatedPosts));
      })
      .catch((error) => (window.location.href = "/login?error=expired"));
  };

  useEffect(() => {
    if (post) {
      setCenter({ lat: post.latitude, lng: post.longitude });
      setMarkerPosition({ lat: post.latitude, lng: post.longitude });
    }
  }, [post]);

  useEffect(() => {
    fetchComment();
  }, []);

  const fetchComment = async () => {
    try {
      const res = await api.get(`/api/posts/${id}/comments`);
      setComments(res.data);
      console.log(res.data);
    } catch (err) {
      console.log("コメント取得失敗：", err);
    }
  };

  if (!isLoaded) return <div>マップ読み込み中...</div>;
  if (!post) return <div>投稿読み込み中...</div>;

  const handleEdit = () => {
    navigate(`/posts/${post.postId}/edit`, { state: { post } });
  };

  const handleDelete = async () => {
    await api.post(`/api/posts/${id}/delete`);
    window.location.href = "/";
  };

  const handleCommentPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/posts/${id}/comments`, {
        content,
      });
      setContent(""); // フォームをリセット
      fetchComment(); // 再取得
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // サーバーからのエラー（例：バリデーション、403など）
          const errorMsg =
            typeof err.response.data === "string"
              ? err.response.data
              : err.response.data.message || "投稿に失敗しました。";
          setMessage(errorMsg);
        } else if (err.request) {
          // リクエストは送られたがレスポンスがない
          setMessage("サーバーからの応答がありませんでした。");
        } else {
          // 何らかのaxios内エラー
          setMessage("リクエスト処理中にエラーが発生しました。");
        }
      } else {
        // axios以外のエラー（コードミスなど）
        setMessage("予期せぬエラーが発生しました。");
      }
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-center">投稿詳細</h2>

      <Row>
        <Col md={8} className="mb-4">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center!}
            zoom={16}
          >
            <Marker position={markerPosition!} />
          </GoogleMap>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-3">{post.content}</Card.Title>
              <Card.Text>
                <strong>住所：</strong> {post.address}
                <br />
                <strong>投稿者：</strong> {post.userName}
                <br />
                <strong>投稿日時：</strong>{" "}
                {new Date(post.createdAt).toLocaleString()}
                <br />
                <strong>更新日時：</strong>{" "}
                {new Date(post.updatedAt).toLocaleString()}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {post.images && post.images.length > 0 && (
        <Row className="mt-4">
          {/* 左半分：写真 */}
          <Col md={6}>
            <Carousel>
              {post.images.map((img) => (
                <Carousel.Item key={img.id}>
                  <img
                    className="d-block w-100"
                    src={`${process.env.REACT_APP_API_URL}${img.imageUrl}`}
                    alt={`Image ${img.sortOrder}`}
                    style={{
                      maxWidth: "100%",
                      height: "400px",
                      objectFit: "contain",
                      borderRadius: "10px",
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>

          {/* 右半分：ボタン + コメント欄 */}
          <Col md={6}>
            <div className="d-flex flex-column gap-2 mb-3">
              <Button
                variant={foundIt ? "warning" : "secondary"}
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleFound}
              >
                <FaIcons.AiOutlineSmile />
                あった！{foundCount}
              </Button>
              <Button
                variant={reported ? "success" : "secondary"}
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={handleReport}
              >
                <FaIcons.AiOutlineMeh />
                見当たりません{reportedCount}
              </Button>

              <form onSubmit={handleCommentPost}>
                <div className="d-flex align-items-start gap-2 mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="コメントを入力"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    style={{ flex: 1 }} // 横幅いっぱい使う
                  />
                  <Button variant="primary" type="submit">
                    投稿
                  </Button>
                </div>
              </form>
              {message && <Alert variant="info">{message}</Alert>}
            </div>

            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                maxHeight: "300px",
                overflowY: "scroll",
              }}
            >
              {/* コメントの例（ここにループでコメント表示可） */}
              {comments.length !== 0 ? (
                comments?.map((comment) => (
                  <div>
                    <span>{comment.username}</span>
                    <span>{" : "}</span>
                    <span>{comment.content}</span>
                  </div>
                ))
              ) : (
                <p>コメントはまだありません。</p>
              )}{" "}
              {/* コメントエリアここまで */}
            </div>
          </Col>
        </Row>
      )}

      {user?.username === post.userName && (
        <Row className="mt-4 justify-content-center gap-2">
          <Col xs="auto">
            <Button variant="primary" onClick={handleEdit}>
              <FaIcons.AiOutlineEdit />
              編集
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="danger" onClick={handleDelete}>
              <FaIcons.AiOutlineDelete />
              削除
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PostDetail;
