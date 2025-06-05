import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Post } from "../types/Types";
import { useEffect, useState } from "react";
import axios from "axios";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Card, Container, Row, Col, Carousel, Button } from "react-bootstrap";
import { useAuthContext } from "../AuthContext";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const PostDetail: React.FC = () => {
  const { state } = useLocation();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(state?.post || null);
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

  const navigate = useNavigate();

  useEffect(() => {
    if (!post && id) {
      axios.get<Post>(`http://localhost:8080/api/posts/${id}`).then((res) => {
        setPost(res.data);
      });
    }
  }, [id, post]);

  useEffect(() => {
    if (post) {
      setCenter({ lat: post.latitude, lng: post.longitude });
      setMarkerPosition({ lat: post.latitude, lng: post.longitude });
    }
  }, [post]);

  if (!isLoaded) return <div>マップ読み込み中...</div>;
  if (!post) return <div>投稿読み込み中...</div>;

  const handleEdit = () => {
    navigate(`/posts/${post.postId}/edit`, { state: { post } });
  };

  const handleDelete = async () => {
    await axios.post(`http://localhost:8080/api/posts/${id}/delete`);
    window.location.href = "/";
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
                    src={`http://localhost:8080${img.imageUrl}`}
                    alt={`Image ${img.sortOrder}`}
                    style={{
                      maxHeight: "400px",
                      objectFit: "cover",
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
              <Button variant="success" className="w-100">
                見つけた
              </Button>
              <Button variant="warning" className="w-100">
                通報
              </Button>
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
              <p>
                <strong>ユーザー1:</strong> ここにコメントが入ります。
              </p>
              <p>
                <strong>ユーザー2:</strong>{" "}
                コメントがたくさんあるとスクロールします。
              </p>
              <p>
                <strong>ユーザー3:</strong> さらにスクロール...
              </p>
              <p>
                <strong>ユーザー4:</strong> こんにちは！
              </p>
              <p>
                <strong>ユーザー5:</strong> テストコメントです。
              </p>
              <p>
                <strong>ユーザー6:</strong> 長文も大丈夫です！
              </p>
              <p>
                <strong>ユーザー1:</strong> ここにコメントが入ります。
              </p>
              <p>
                <strong>ユーザー2:</strong>{" "}
                コメントがたくさんあるとスクロールします。
              </p>
              <p>
                <strong>ユーザー3:</strong> さらにスクロール...
              </p>
              <p>
                <strong>ユーザー4:</strong> こんにちは！
              </p>
              <p>
                <strong>ユーザー5:</strong> テストコメントです。
              </p>
              <p>
                <strong>ユーザー6:</strong> 長文も大丈夫です！
              </p>{" "}
              {/* コメントエリアここまで */}
            </div>
          </Col>
        </Row>
      )}

      {user?.username === post.userName && (
        <Row className="mt-4 justify-content-center gap-2">
          <Col xs="auto">
            <Button variant="primary" onClick={handleEdit}>
              編集
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="danger" onClick={handleDelete}>
              削除
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default PostDetail;
